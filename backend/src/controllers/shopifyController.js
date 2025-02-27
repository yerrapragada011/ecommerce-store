require('dotenv').config()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {
  getGraphqlClient,
  getAdminGraphqlClient,
} = require('../middleware/shopifyClient')

const getProducts = async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const client = getAdminGraphqlClient(shop)

    const query = `
        query {
          products(first: 10) {
            edges {
              node {
                id
                title
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      price
                      contextualPricing(context: { country: US }) {
                        price {
                          amount
                          currencyCode
                        }
                      }
                      selectedOptions {
                        name
                        value
                      }
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
        }
`

    const response = await client.request(query)

    if (!response.products || !response.products.edges.length) {
      console.error('No products found or incorrect data format')
      return res
        .status(500)
        .json({ error: 'No products found or incorrect data format' })
    }

    const products = response.products.edges.map((edge) => {
      const product = edge.node
      return {
        id: product.id,
        title: product.title,
        images: product.images.edges.map((img) => ({
          url: img.node.url,
          altText: img.node.altText,
        })),
        variants: product.variants.edges.map((variant) => ({
          id: variant.node.id,
          title: variant.node.title,
          price: variant.node.price,
          currency: variant.node.contextualPricing.price.currencyCode,
          selectedOptions: variant.node.selectedOptions,
          inventoryQuantity: variant.node.inventoryQuantity,
        })),
      }
    })

    return res.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error.message)
    res.status(500).json({ error: 'Failed to fetch products.' })
  }
}

const createCheckout = async (req, res) => {
  const { lineItems } = req.body

  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const client = getAdminGraphqlClient(shop)

    const query = `
      mutation {
        draftOrderCreate(input: {
          lineItems: [
            ${lineItems
              .map(
                (item) => `
                  {
                    variantId: "${item.variant_id}",
                    quantity: ${item.quantity}
                  }
                `
              )
              .join(',')}
          ]
        }) {
          draftOrder {
            id
            invoiceUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await client.request(query)

    if (response?.errors) {
      throw new Error(`GraphQL Error: ${response.errors[0].message}`)
    }

    const checkoutUrl = response?.data?.draftOrderCreate?.draftOrder?.invoiceUrl

    if (!checkoutUrl) {
      throw new Error('Failed to retrieve checkout URL.')
    }

    res.status(201).json({ checkoutUrl })
  } catch (error) {
    console.error('Error creating draft order:', error.message)
    res.status(500).json({ error: 'Failed to create draft order.' })
  }
}

const OTP_EXPIRATION = '10m'

const requestOtp = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' })
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const payload = { email, otp }

    const otpToken = jwt.sign(payload, process.env.OTP_SECRET, {
      expiresIn: OTP_EXPIRATION,
    })

    console.log(`Sending OTP ${otp} to email: ${email}`)

    res.status(200).json({ message: 'OTP sent to email.', otpToken })
  } catch (error) {
    console.error('Error requesting OTP:', error.message)
    res.status(500).json({ error: 'Failed to request OTP.' })
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp, otpToken } = req.body
    if (!email || !otp || !otpToken) {
      return res
        .status(400)
        .json({ error: 'Email, OTP, and token are required.' })
    }

    let decoded
    try {
      decoded = jwt.verify(otpToken, process.env.OTP_SECRET)
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired OTP token.' })
    }

    if (decoded.email !== email || decoded.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' })
    }

    const tempPassword = crypto.randomBytes(8).toString('hex')

    const shop = process.env.SHOPIFY_STORE_URL
    const client = getGraphqlClient(shop)

    let loginQuery = `
      mutation {
        customerAccessTokenCreate(input: {
          email: "${email}",
          password: "${tempPassword}"
        }) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `
    let response = await client.request(loginQuery)

    console.log('Shopify login response:', JSON.stringify(response, null, 2));

    let errors = response?.customerAccessTokenCreate?.customerUserErrors

    if (errors && errors.length > 0) {
      console.error('Shopify Login Errors:', errors);
      return res.status(400).json({ error: errors });
    }

    if (errors && errors.length > 0) {
      const createQuery = `
        mutation {
          customerCreate(input: {
            email: "${email}",
            password: "${tempPassword}"
          }) {
            customer {
              id
              email
            }
            customerUserErrors {
              field
              message
            }
          }
        }
      `
      const createResponse = await client.request(createQuery)
      const createErrors =
        createResponse?.data?.customerCreate?.customerUserErrors

      if (createErrors && createErrors.length > 0) {
        return res.status(400).json({ error: createErrors })
      }

      response = await client.request(loginQuery)
      errors = response?.data?.customerAccessTokenCreate?.customerUserErrors

      if (errors && errors.length > 0) {
        return res.status(400).json({ error: errors })
      }
    }

    const accessToken =
      response.data.customerAccessTokenCreate.customerAccessToken.accessToken

    res.cookie('_merchant_essential', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    })
    res.cookie('_merchant_marketing', 'true', {
      httpOnly: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    })

    res.status(200).json({ message: 'OTP verified. Login successful.' })
  } catch (error) {
    console.error('Error verifying OTP:', error.message)
    res.status(500).json({ error: 'OTP verification failed.' })
  }
}

const getAccount = async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const client = getGraphqlClient(shop)
    const accessToken = req.cookies._merchant_essential
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated.' })
    }

    const query = `
      query {
        customer(customerAccessToken: "${accessToken}") {
          firstName
          lastName
          email
          phone
          orders(first: 10) {
            edges {
              node {
                id
                orderNumber
                totalPriceV2 {
                  amount
                  currencyCode
                }
                processedAt
              }
            }
          }
          addresses(first: 10) {
            edges {
              node {
                id
                address1
                address2
                city
                province
                country
                zip
                phone
              }
            }
          }
        }
      }
    `

    const response = await client.request(query)
    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    const customer = response.data.customer
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' })
    }

    res.json({ customer })
  } catch (error) {
    console.error('Error fetching account:', error.message)
    res.status(500).json({ error: 'Failed to fetch account details.' })
  }
}

const addAddress = async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const client = getGraphqlClient(shop)
    const accessToken = req.cookies._merchant_essential
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated.' })
    }

    const { address1, address2, city, province, country, zip, phone } = req.body
    const query = `
      mutation {
        customerAddressCreate(
          customerAccessToken: "${accessToken}",
          address: {
            address1: "${address1}",
            address2: "${address2}",
            city: "${city}",
            province: "${province}",
            country: "${country}",
            zip: "${zip}",
            phone: "${phone}"
          }
        ) {
          customerAddress {
            id
            address1
            address2
            city
            province
            country
            zip
            phone
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `

    const response = await client.request(query)
    const errors = response.data.customerAddressCreate.customerUserErrors
    if (errors && errors.length > 0) {
      return res.status(400).json({ error: errors })
    }
    res
      .status(201)
      .json({ address: response.data.customerAddressCreate.customerAddress })
  } catch (error) {
    console.error('Error adding address:', error.message)
    res.status(500).json({ error: 'Failed to add address.' })
  }
}

const logout = (req, res) => {
  res.clearCookie('_merchant_essential')
  res.clearCookie('_merchant_marketing')
  res.status(200).json({ message: 'Logout successful.' })
}

module.exports = {
  getProducts,
  createCheckout,
  requestOtp,
  verifyOtp,
  getAccount,
  addAddress,
  logout,
}

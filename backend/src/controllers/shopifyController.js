require('dotenv').config()
const axios = require('axios')
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

const getAccountCallback = async (req, res) => {
  try {
    const { code, shop } = req.query

    console.log(code)

    if (!code || !shop) {
      return res
        .status(400)
        .json({ error: 'Missing code or shop in callback request' })
    }

    const accessTokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_PARTNER_CLIENT_ID,
        client_secret: process.env.SHOPIFY_PARTNER_CLIENT_SECRET,
        code,
      }
    )

    const { access_token } = accessTokenResponse.data

    res.cookie('_merchant_essential', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 * 1000,
      sameSite: 'Strict',
    })

    res.redirect('http://localhost:3000/account')
  } catch (error) {
    console.error('Error during OAuth callback:', error)
    res.status(500).json({ error: 'Failed to exchange code for access token' })
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
  getAccount,
  getAccountCallback,
  addAddress,
  logout,
}

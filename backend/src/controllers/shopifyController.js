require('dotenv').config()
const { getGraphqlClient } = require('../middleware/shopifyClient')

const getProducts = async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const client = getGraphqlClient(shop)

    const query = `
        query {
          products(first: 10) {
            edges {
              node {
                id
                title
                variants(first: 5) {
                  edges {
                    node {
                      id
                      price
                    }
                  }
                }
              }
            }
          }
        }
      `

    const response = await client.request(query)

    if (response && response.body && response.body.errors) {
      throw new Error(`GraphQL Error: ${response.body.errors[0].message}`)
    }

    const products = response.data.products.edges.map((edge) => edge.node)
    return res.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products.' })
  }
}

const createCheckout = async (req, res) => {
  const { lineItems, email } = req.body

  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shop || !accessToken) {
      return res
        .status(500)
        .json({ error: 'Shop or Access Token is not configured.' })
    }

    const query = `
        mutation {
          checkoutCreate(input: {
            email: "${email}",
            lineItems: ${JSON.stringify(
              lineItems.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
              }))
            )}
          }) {
            checkout {
              id
              webUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `

    // Make the GraphQL request to create the checkout
    const response = await graphqlClient.query({ data: { query } })

    if (response.errors) {
      throw new Error(`GraphQL Error: ${response.errors[0].message}`)
    }

    const checkoutUrl = response.data.checkoutCreate.checkout.webUrl

    res.status(201).json({ checkoutUrl })
  } catch (error) {
    console.error('Error creating checkout:', error)
    res.status(500).json({ error: 'Failed to create checkout session.' })
  }
}

module.exports = { getProducts, createCheckout }

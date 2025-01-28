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
  const { lineItems } = req.body

  try {
    const shop = process.env.SHOPIFY_STORE_URL
    const client = getGraphqlClient(shop)

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

    if (response && response.errors) {
      throw new Error(`GraphQL Error: ${response.errors[0].message}`)
    }

    res.status(201).json({
      checkoutUrl: response.data.draftOrderCreate.draftOrder.invoiceUrl,
    })
  } catch (error) {
    console.error('Error creating draft order:', error)
    res.status(500).json({ error: 'Failed to create draft order.' })
  }
}

module.exports = { getProducts, createCheckout }

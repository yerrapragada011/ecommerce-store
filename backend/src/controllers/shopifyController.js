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
              images(first: 5) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    price
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

    if (response?.body?.errors) {
      throw new Error(`GraphQL Error: ${response.body.errors[0].message}`)
    }

    const products =
      response?.data?.products?.edges?.map((edge) => edge.node) || []

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

module.exports = { getProducts, createCheckout }

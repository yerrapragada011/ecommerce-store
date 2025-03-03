require('dotenv').config()
const { getAdminGraphqlClient } = require('../middleware/shopifyClient')

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

    const checkoutUrl = response?.draftOrderCreate?.draftOrder?.invoiceUrl

    if (!checkoutUrl) {
      throw new Error('Failed to retrieve checkout URL.')
    }

    res.status(201).json({ checkoutUrl })
  } catch (error) {
    console.error('Error creating draft order:', error.message)
    res.status(500).json({ error: 'Failed to create draft order.' })
  }
}

module.exports = {
  getProducts,
  createCheckout,
}

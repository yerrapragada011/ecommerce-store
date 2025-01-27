require('dotenv').config()
const { getSession, shopify } = require('../middleware/shopifyClient')

const getProducts = async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_STORE_URL

    const session = getSession(shop)
    if (!session) {
      console.error('Failed to retrieve session')
      return res.status(500).json({ error: 'Session retrieval failed.' })
    }

    const products = await shopify.rest.Product.all({ session })

    if (Array.isArray(products.data)) {
      return res.json({ products: products.data })
    } else {
      throw new Error('Products is not an array')
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products.' })
  }
}

const createOrder = async (req, res) => {
  const { lineItems, email, shippingAddress } = req.body

  try {
    const shop = process.env.SHOPIFY_STORE_URL

    const session = getSession(shop)

    if (!session) {
      console.error('Failed to retrieve session')
      return res.status(500).json({ error: 'Session retrieval failed.' })
    }

    const orderData = {
      line_items: lineItems,
      email,
      shipping_address: shippingAddress,
    }

    const response = await shopify.rest.Order.create({
      session,
      body: { order: orderData },
    })

    res.status(201).json(response.data)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order.' })
  }
}

module.exports = { getProducts, createOrder }

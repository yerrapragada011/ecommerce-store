require('dotenv').config()
const { getSession, shopify } = require('../middleware/shopifyClient')

const getProducts = async (req, res) => {
  try {
    const shop = process.env.SHOPIFY_STORE_URL
    console.log('Shop URL:', shop)

    const session = getSession(shop)
    if (!session) {
      console.error('Failed to retrieve session')
      return res.status(500).json({ error: 'Session retrieval failed.' })
    }

    console.log('Session retrieved:', session)

    const products = await shopify.rest.Product.all({ session })
    console.log('Fetched Products:', products)

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
    const session = await getSession() // Get session
    const orderData = {
      line_items: lineItems,
      email,
      shipping_address: shippingAddress,
    }

    const response = await Order.create({
      session,
      body: { order: orderData },
    })

    res.status(201).json(response.data)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order.' })
  }
}

const ping = async (req, res) => {
  res.status(200).json({ message: 'Pong!' })
}

module.exports = { getProducts, createOrder, ping }

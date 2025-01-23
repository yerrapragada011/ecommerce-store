const shopify = require('../middleware/shopifyClient')

const getProducts = async (req, res) => {
  try {
    const response = await shopify.get({ path: 'products' })
    res.status(200).json(response.body.products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products.' })
  }
}

const createOrder = async (req, res) => {
  const { lineItems, email, shippingAddress } = req.body

  try {
    const orderData = {
      order: {
        line_items: lineItems,
        email,
        shipping_address: shippingAddress,
      },
    }

    const response = await shopify.post({ path: 'orders', data: orderData })
    res.status(201).json(response.body.order)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order.' })
  }
}

module.exports = { getProducts, createOrder }

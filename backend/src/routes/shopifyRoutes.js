const express = require('express')
const {
  getProducts,
  createCheckout,
} = require('../controllers/shopifyController')

const router = express.Router()

router.get('/products', getProducts)
router.post('/checkout', createCheckout)

module.exports = router

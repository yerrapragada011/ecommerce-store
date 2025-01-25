const express = require('express')
const {
  getProducts,
  createOrder,
  ping,
} = require('../controllers/shopifyController')

const router = express.Router()

router.get('/products', getProducts)
router.post('/order', createOrder)
router.get('/ping', ping)

module.exports = router

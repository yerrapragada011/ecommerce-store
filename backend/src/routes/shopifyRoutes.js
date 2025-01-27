const express = require('express')
const { getProducts, createOrder } = require('../controllers/shopifyController')

const router = express.Router()

router.get('/products', getProducts)
router.post('/order', createOrder)

module.exports = router

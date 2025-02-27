const express = require('express')
const {
  getProducts,
  createCheckout,
  getAccount,
  getAccountCallback,
  addAddress,
  logout,
} = require('../controllers/shopifyController')

const router = express.Router()

router.get('/products', getProducts)
router.post('/checkout', createCheckout)
router.get('/account', getAccount)
router.get('/account/callback', getAccountCallback)
router.post('/account/address', addAddress)
router.post('/logout', logout)

module.exports = router

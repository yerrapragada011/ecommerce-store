const express = require('express')
const {
  getProducts,
  createCheckout,
  requestOtp,
  verifyOtp,
  getAccount,
  addAddress,
  logout,
} = require('../controllers/shopifyController')

const router = express.Router()

router.get('/products', getProducts)
router.post('/checkout', createCheckout)
router.post('/request-otp', requestOtp)
router.post('/verify-otp', verifyOtp)
router.get('/account', getAccount)
router.post('/account/address', addAddress)
router.post('/logout', logout)

module.exports = router

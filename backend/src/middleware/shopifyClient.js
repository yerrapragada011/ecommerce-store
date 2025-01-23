require('dotenv').config()
const { Shopify } = require('@shopify/shopify-api')

const shopify = new Shopify.Clients.Rest(
  process.env.SHOPIFY_STORE_NAME,
  process.env.SHOPIFY_ACCESS_TOKEN
)

module.exports = shopify

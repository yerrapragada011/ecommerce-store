require('dotenv').config()
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api')
const { nodeRuntime } = require('@shopify/shopify-api/adapters/node')

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: process.env.SHOPIFY_API_SCOPES.split(','),
  hostName: process.env.SHOPIFY_HOST_NAME,
  apiVersion: ApiVersion.July23,
  isEmbeddedApp: false,
  isPrivateApp: true,
  ...(nodeRuntime ? { runtime: nodeRuntime } : {}),
})

module.exports = shopify

require('dotenv').config()
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api')
const { NodeAdapter } = require('@shopify/shopify-api/adapters/node')
const { restResources } = require('@shopify/shopify-api/rest/admin/2023-10')

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  scopes: process.env.SHOPIFY_API_SCOPES.split(','),
  hostName: process.env.SHOPIFY_STORE_URL,
  apiVersion: LATEST_API_VERSION,
  isPrivateApp: true,
  adapter: NodeAdapter,
  restResources: restResources,
})

const getSession = (shop) => {
  console.log('Access Token:', process.env.SHOPIFY_ACCESS_TOKEN)
  // Manually create a session for testing purposes
  const session = shopify.session.customAppSession(shop)
  session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN // Manually set the token for now
  session.scope = process.env.SHOPIFY_API_SCOPES.split(',') // Manually set the scopes for now

  if (!session.accessToken) {
    console.error('No access token found in session')
    return null
  }

  console.log('Session with access token:', session)
  return session
}

module.exports = { shopify, getSession }

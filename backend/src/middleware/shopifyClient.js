require('dotenv').config()
const { shopifyApi } = require('@shopify/shopify-api')
const { NodeAdapter } = require('@shopify/shopify-api/adapters/node')

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  scopes: process.env.SHOPIFY_API_SCOPES.split(','),
  hostName: process.env.SHOPIFY_STORE_URL,
  apiVersion: '2025-01',
  isPrivateApp: true,
  adapter: NodeAdapter,
})

const getSession = (shop) => {
  const session = shopify.session.customAppSession(shop)
  session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN
  session.scope = process.env.SHOPIFY_API_SCOPES.split(',')

  if (!session.accessToken) {
    console.error('No access token found in session')
    return null
  }

  return session
}

const getGraphqlClient = (shop) => {
  const session = getSession(shop)
  if (!session) {
    throw new Error('Session not found')
  }

  const graphqlClient = new shopify.clients.Graphql({ session })
  return graphqlClient
}

module.exports = { shopify, getSession, getGraphqlClient }

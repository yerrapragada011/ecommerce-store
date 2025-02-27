require('dotenv').config()
const { shopifyApi } = require('@shopify/shopify-api')
const { NodeAdapter } = require('@shopify/shopify-api/adapters/node')
const { GraphQLClient } = require('graphql-request')

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
  const storefrontAccessToken = process.env.STOREFRONT_ACCESS_TOKEN

  if (!storefrontAccessToken) {
    console.error('Storefront access token is missing')
    throw new Error('Storefront access token is missing')
  }

  const graphqlClient = new GraphQLClient(
    `https://${shop}/api/2023-01/graphql.json`,
    {
      headers: {
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
    }
  )

  return graphqlClient
}

const getAdminGraphqlClient = (shop) => {
  const adminAccessToken = process.env.SHOPIFY_ACCESS_TOKEN

  if (!adminAccessToken) {
    console.error('Admin access token is missing')
    throw new Error('Admin access token is missing')
  }

  const graphqlClient = new GraphQLClient(
    `https://${shop}/admin/api/2023-01/graphql.json`,
    {
      headers: {
        'X-Shopify-Access-Token': adminAccessToken,
      },
    }
  )

  return graphqlClient
}

module.exports = {
  shopify,
  getSession,
  getGraphqlClient,
  getAdminGraphqlClient,
}

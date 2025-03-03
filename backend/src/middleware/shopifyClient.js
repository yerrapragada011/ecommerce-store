require('dotenv').config()
const { GraphQLClient } = require('graphql-request')

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
  getAdminGraphqlClient,
}

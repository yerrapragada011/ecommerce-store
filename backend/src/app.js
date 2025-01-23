const express = require('express')
const cors = require('cors')
const shopifyRoutes = require('./routes/shopifyRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/shopify', shopifyRoutes)

module.exports = app

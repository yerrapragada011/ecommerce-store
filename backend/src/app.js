const express = require('express')
const cors = require('cors')
const shopifyRoutes = require('./routes/shopifyRoutes')
const cookieParser = require('cookie-parser');

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

app.use('/api/shopify', shopifyRoutes)

module.exports = app
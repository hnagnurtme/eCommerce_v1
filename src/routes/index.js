const express = require('express')
const { apiKey , permission } = require('../auth/checkAuth')
const route = express.Router()
// check api key

route.use(apiKey)

// check permisssions
route.use(permission('0000'))

route.use('/v1/api', require('./access'))

module.exports = route
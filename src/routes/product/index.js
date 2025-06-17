const express = require('express')
const productController = require('../../controllers/product.controller');
const  asyncHandle  = require('../../helper/asyncHandle');
const { authenciation } = require('../../auth/authUtils');
const route = express.Router()


route.use(authenciation)

route.post('', asyncHandle(productController.createNewProduct))
module.exports = route
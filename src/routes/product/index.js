const express = require('express')
const productController = require('../../controllers/product.controller');
const  asyncHandle  = require('../../helper/asyncHandle');
const { authenciationV2 } = require('../../auth/authUtils');
const route = express.Router()


route.get('/search/:keySearch', asyncHandle(productController.searchProductByUser))
route.use(authenciationV2)


route.post('', asyncHandle(productController.createNewProduct))
route.post('/publish/:id', asyncHandle(productController.publishProductByShop))
route.post('/unpublish/:id', asyncHandle(productController.unPublishProductByShop))

route.get('/draft/all', asyncHandle(productController.getAllDraftForShop))
route.get('/publish/all',asyncHandle(productController.getAllPublishForrShop))
module.exports = route
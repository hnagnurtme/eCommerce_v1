const express = require('express')
const productController = require('../../controllers/product.controller');
const  asyncHandle  = require('../../helper/asyncHandle');
const { authenciationV2 } = require('../../auth/authUtils');
const route = express.Router()

// Routes công khai (không yêu cầu xác thực)
route.get('/search/:keySearch', asyncHandle(productController.searchProductByUser))
route.get('', asyncHandle(productController.findAllProduct))

// Các route yêu cầu xác thực
route.use(authenciationV2)

// Routes cho sản phẩm
route.post('', asyncHandle(productController.createNewProduct))
route.patch('/:id', asyncHandle(productController.updateProduct))  // Cập nhật sản phẩm
route.delete('/:id', asyncHandle(productController.deleteProduct)) // Xóa sản phẩm

// Routes cho trạng thái sản phẩm
route.post('/publish/:id', asyncHandle(productController.publishProductByShop))
route.post('/unpublish/:id', asyncHandle(productController.unPublishProductByShop))

// Routes cho việc lấy danh sách sản phẩm theo trạng thái
route.get('/draft/all', asyncHandle(productController.getAllDraftForShop))
route.get('/publish/all',asyncHandle(productController.getAllPublishForShop))

// Route để lấy chi tiết sản phẩm (phải đặt sau các route khác có tiền tố)
route.get('/:id', asyncHandle(productController.getProductById))
module.exports = route
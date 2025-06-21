const ProductFactory = require("../services/product.service")
const { OK, CREATED} = require('../core/sucess.response')
class ProductController {
    
    createNewProduct = async (req, res, next) =>{
        return new OK({
            message : 'Create product successfully',
            metadata : await ProductFactory.createProduct(req.body.product_type,{
                ...req.body,
                product_shop : req.user.userId
            })
        }).send(res)
    }

    getAllDraftForShop = async(req, res, next) =>{
        return new OK({
            message : 'Fetch all draft product successfully',
            metadata : await ProductFactory.findAllDraftForShop({
                product_shop : req.user.userId
            })
        }).send(res)
    }


    getAllPublishForShop = async(req, res, next) =>{
        return new OK({
            message : 'Fetch all publish product successfully',
            metadata : await ProductFactory.findAllPublishForShop({
                product_shop : req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async(req, res, next) =>{
        return new OK({
            message : 'Publish product successfully',
            metadata : await ProductFactory.publishProductByShop({
                product_id : req.params.id,
                product_shop : req.user.userId
            })
        }).send(res)
    }
    unPublishProductByShop = async(req, res, next) =>{
        return new OK({
            message : 'Unpublish product successfully',
            metadata : await ProductFactory.unPublishProductByShop({
                product_id : req.params.id,
                product_shop : req.user.userId
            })
        }).send(res)
    }
    searchProductByUser = async(req, res, next) =>{
        const { keySearch } = req.query
        return new OK({
            message : 'Search product successfully',
            metadata : await ProductFactory.searchProduct({ keySearch })
        }).send(res)
    }

    findAllProduct = async(req, res, next) =>{
        return new OK({
            message : 'Search product successfully',
            metadata : await ProductFactory.findAllProducts(req.query)
        }).send(res)
    }

    // Phương thức mới: Cập nhật sản phẩm
    updateProduct = async (req, res, next) => {
        return new OK({
            message: 'Update product successfully',
            metadata: await ProductFactory.updateProduct(
                req.body.product_type,
                req.params.id,
                {
                    ...req.body,
                    product_shop: req.user.userId
                }
            )
        }).send(res)
    }

    // Phương thức mới: Xóa sản phẩm
    deleteProduct = async (req, res, next) => {
        return new OK({
            message: 'Delete product successfully',
            metadata: await ProductFactory.deleteProduct(req.params.id)
        }).send(res)
    }

    // Phương thức mới: Lấy chi tiết sản phẩm theo ID
    getProductById = async (req, res, next) => {
        return new OK({
            message: 'Get product detail successfully',
            metadata: await ProductFactory.findProductById(req.params.id)
        }).send(res)
    }
}

module.exports = new ProductController()
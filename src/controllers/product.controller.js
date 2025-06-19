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
}

module.exports = new ProductController()
const { OK } = require("../core/sucess.response")
const CartService = require("../services/cart.service")

class CartController {
    addToCart = async ( req, res ,next) =>{
        return new OK({
            message :'Add to cart successfully',
            metadata : await CartService.addToCart(req.body)
        }).send(res)
    }


    updateCart = async ( req, res ,next) =>{
        return new OK({
            message :'Add to cart successfully',
            metadata : await CartService.addToCartV2(req.body)
        }).send(res)
    }


    deleteCart = async ( req, res ,next) =>{
        return new OK({
            message :'Add to cart successfully',
            metadata : await CartService.deleteUserCart(req.body)
        }).send(res)
    }

    listToCart = async ( req, res ,next) =>{
        return new OK({
            message :'Add to cart successfully',
            metadata : await CartService.getListUserCart(req.query)
        }).send(res)
    }

}

module.exports =  new CartController()
/* 
    1. add product to cart [User]
    2. reduce product quantity for one [User]
    3. increase product quantity for one [User]
    4. get cart [User]
    5. delete cart [User]
    6. delete cart item [User]
*/

const { throttle, update } = require("lodash");
const {cartModel} = require("../models/cart.model");
const { createUserCart, updateCartQuantity } = require("../models/repositories/cart.repo");
const { findProductById } = require("../models/repositories/product.repo");
const { NotFoundError } = require("../core/error.respone");


class CartService {
    static async addToCart({ userId,product = {}}){
        const userCart = await cartModel.findOne({
            cart_userId : userId
        })

        if( !userCart){
            // create cart for user 
            return await createUserCart({userId, product})
        }
        // da co gio hang chua co san pham
        if(!userCart.cart_products.length){
            userCart.cart_products = [product]
            return await userCart.save()
        }
        // da co san pham
        return await updateCartQuantity({ userId, product})
    }
    

    static async addToCartV2({ userId,shop_order_ids}){
        const { productId, quantity,old_quantity} = shop_order_ids[0]?.item_products[0]
        /// check product co ton tai ko
        const foundProduct = await findProductById(productId)
        if( !foundProduct){
            throw NotFoundError('Khong ton tai')
        }

        if( foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw NotFoundError('Khong ton tai product id')
        }

        if(quantity === 0){

        }

        return await updateCartQuantity({
            userId,
            product : {
                productId,
                quantity : quantity - old_quantity
            }
        })
    }

    static async deleteUserCart({ userId, productId}){
        const query = {
            cart_userId : userId,
            cart_state : 'active'
        },
        updateSet =  {
            $pull : {
                cart_products : {
                    productId
                }
            }
        }

        const deleteCart = await cartModel.updateOne(query, updateSet)

        return deleteCart
    }

    static async getListUserCart({ userId}){
        return await cartModel.findOne({
            cart_userId : userId
        }).lean()
    }

}


module.exports = CartService
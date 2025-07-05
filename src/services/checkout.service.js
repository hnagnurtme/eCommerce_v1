const { NotFoundError } = require("../core/error.response")
const { findCartById } = require("../models/repositories/cart.repo")
const { getDiscountAmount } = require('../services/discount.service')
const { checkProductServer } = require('../models/repositories/cart.repo')
const { acquireLock, releaseLock } = require("./redis.service")
const {orderModel } = require('../models/order.model')
class CheckoutService {
    static async checkoutReview({
        cartId,userId,shop_order_ids
    }){

        const foundCart = await findCartById(cartId)
        if( !foundCart){
            throw new NotFoundError('Khong thay')
        }
        const check_out_order = {
            totalPrice : 0,
            feeShip : 0,
            totalDiscount : 0,
            totalCheckout : 0
        }

        let shop_order_ids_new = []
        for(let i = 0; i < shop_order_ids.length;i++){
            const { shopId,shop_discounts = [],item_products = []} = shop_order_ids[i]

            const validatedProducts = await checkProductServer(item_products)
            if(!validatedProducts[0] ){
                throw new NotFoundError('Wrong')
            }

            const checkoutPrice = validatedProducts.reduce((acc, product) =>{
                return acc + ( product.quantity * product.price) 
            },0)


            check_out_order.totalPrice += checkoutPrice


            const item_checkout = {
                shopId,
                shop_discounts,
                priceRaw :checkoutPrice,
                priceApplyDiscount :checkoutPrice,
                item_products : validatedProducts
            }

            if( shop_discounts.length >0){
                const { totalPrice = 0,discount = 0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products : checkProductServer
                })

                check_out_order.totalDiscount +=discount

                if( discount > 0){
                    item_checkout.priceApplyDiscount =checkoutPrice -discount
                }
            }

            check_out_order.totalCheckout +=item_checkout.priceApplyDiscount
            shop_order_ids_new.push(item_checkout)

        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            check_out_order
        }

    }


    // order
    static async orderByUSer({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment =  {}
    }){
        const { shop_order_ids_new , checkout_order} = await CheckoutService.checkoutReview({
            cartId,
            userId,shop_order_ids
        })

        const products = shop_order_ids_new.flatMap( order => order.item_products)
        console.log(`[1] : `, products)

        const acquireProduct = []
        /// optimistes lock
        for( let i =  0; i < products.length;i++){
            const { productId, quantity} = products[i];
            const keyLock = await acquireLock(productId,cartId,quantity)
            acquireProduct.push(keyLock ? true : false)
            if(keyLock){
                await releaseLock(keyLock)
            }
        }

        /// check false
        if(acquireProduct.includes(false)){
            throw new NotFoundError(' Loi het hang')
        }

        const newOrder = await orderModel.create({
            order_userId : userId,
            order_checkout : checkout_order,
            order_shipping : user_address,
            order_payment : user_payment,
            order_products : shop_order_ids_new
        })
        if (newOrder){
            
        }

    }
}

module.exports = CheckoutService
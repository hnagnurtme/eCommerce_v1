const { NotFoundError } = require("../core/error.respone")
const { findCartById } = require("../models/repositories/cart.repo")
const {getDiscountAmount } = require('../services/discount.service')
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

        shop_order_ids_new = []
        for(let i = 0; i < shop_order_ids.length;i++){
            const { shopId,shop_discounts = [],item_products = []} = shop_order_ids[i]

            const checkProductServer = await checkProductServer(item_products)
            if(!checkProductServer[0] ){
                throw new NotFoundError('Wrong')
            }

            const checkoutPrice = checkProductServer.reduce((acc, product) =>{
                return acc + ( product.quantity * product.price) 
            },0)


            check_out_order.totalPrice += checkoutPrice


            const item_checkout = {
                shopId,
                shop_discounts,
                priceRaw :checkoutPrice,
                priceApplyDiscount :checkoutPrice,
                item_products : checkProductServer
            }

            if( shopDiscount.length >0){
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
}

module.exports = CheckoutService
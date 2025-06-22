const { OK } = require("../core/sucess.response")
const { checkoutReview } = require("../services/checkout.service")

class CheckoutController {
    checkoutReview = async (req, res, next) => {
        return new OK({
            message :'Checkout successfully',
            metadata : await checkoutReview(req.body)
        }).send(res)
    }
}

module.exports = new CheckoutController()
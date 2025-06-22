import { OK } from "../core/success.response.js";
import { checkoutReview } from "../services/checkout.service.js";

class CheckoutController {
    checkoutReview = async (req, res, next) => {
        return new OK({
            message :'Checkout successfully',
            metadata : await checkoutReview(req.body)
        }).send(res)
    }
}

export default new CheckoutController();
const DiscountService = require('../services/discount.service');
const { OK, CREATED } = require('../core/sucess.response');

class DiscountController {
    
    createDiscountCode = async (req, res, next) => {
        return new CREATED({
            message: 'Discount code created successfully',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getAllDiscountCodes = async (req, res, next) => {
        return new OK({
            message: 'Get discount codes successfully',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                shopId: req.user.userId,
                limit: req.query.limit,
                page: req.query.page
            })
        }).send(res);
    }

    getDiscountByCode = async (req, res, next) => {
        return new OK({
            message: 'Get discount by code successfully',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                code: req.params.code,
                shopId: req.params.shopId,
                userId: req.user.userId,
                limit: req.query.limit,
                page: req.query.page
            })
        }).send(res);
    }

    getDiscountAmount = async (req, res, next) => {
        return new OK({
            message: 'Get discount amount successfully',
            metadata: await DiscountService.getDiscountAmount({
                codeId: req.body.code,
                userId: req.user.userId,
                shopId: req.body.shopId,
                products: req.body.products
            })
        }).send(res);
    }

    deleteDiscountCode = async (req, res, next) => {
        return new OK({
            message: 'Delete discount code successfully',
            metadata: await DiscountService.deleteDiscountCode({
                shopId: req.user.userId,
                codeId: req.params.code
            })
        }).send(res);
    }

    cancelDiscountCode = async (req, res, next) => {
        return new OK({
            message: 'Cancel discount code successfully',
            metadata: await DiscountService.cancelDiscountCode({
                shopId: req.body.shopId,
                codeId: req.body.code,
                userId: req.user.userId
            })
        }).send(res);
    }
}

module.exports = new DiscountController();

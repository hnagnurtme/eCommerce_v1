const express = require('express');
const discountController = require('../../controllers/discount.controller');
const asyncHandle = require('../../helper/asyncHandle');
const { authenciationV2 } = require('../../auth/authUtils');
const router = express.Router();

// Routes requiring authentication
router.use(authenciationV2);

// Routes for shop to manage discounts
router.post('', asyncHandle(discountController.createDiscountCode));
router.get('', asyncHandle(discountController.getAllDiscountCodes));
router.delete('/:code', asyncHandle(discountController.deleteDiscountCode));

// Routes for users to interact with discounts
router.get('/product/:code/:shopId', asyncHandle(discountController.getDiscountByCode));
router.post('/amount', asyncHandle(discountController.getDiscountAmount));
router.post('/cancel', asyncHandle(discountController.cancelDiscountCode));

module.exports = router;

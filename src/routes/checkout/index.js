const express = require('express');
const checkoutController = require('../../controllers/checkout.controller')
const asyncHandle = require('../../helper/asyncHandle');
const { authenciationV2 } = require('../../auth/authUtils');
const router = express.Router();

// Routes requiring authentication
router.use(authenciationV2);

// Routes for shop to manage discounts
router.post('', asyncHandle(checkoutController.checkoutReview));

module.exports = router;

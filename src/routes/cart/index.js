const express = require('express');
const cartController = require('../../controllers/cart.controller')
const asyncHandle = require('../../helper/asyncHandle');
const { authenciationV2 } = require('../../auth/authUtils');
const router = express.Router();

// Routes requiring authentication
router.use(authenciationV2);

// Routes for shop to manage discounts
router.post('', asyncHandle(cartController.addToCart));
router.get('', asyncHandle(cartController.listToCart));
router.post('/update', asyncHandle(cartController.updateCart));
router.delete('', asyncHandle(cartController.deleteCart));

module.exports = router;

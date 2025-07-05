const express = require('express');

const asyncHandle = require('../../helper/asyncHandle');
const { authenciationV2 } = require('../../auth/authUtils');
const inventoryController = require('../../controllers/inventory.controller');
const router = express.Router();

// Routes requiring authentication
router.use(authenciationV2);

// Routes for shop to manage discounts
router.post('', asyncHandle(inventoryController.addStockToInventory));



module.exports = router;

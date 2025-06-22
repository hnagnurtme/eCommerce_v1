const { convertToObjectId } = require("../../utils")
const { inventoryModel } = require("../inventory.model")
const { Types } = require('mongoose')

const insertInventory = async (
    productId, shopId, stock, location = 'Unknown'
) => {
    return await inventoryModel.create({
        inven_productId: convertToObjectId(productId),
        inven_shopId: convertToObjectId(shopId),
        inven_stock: stock,
        inven_location: location,
    });
};

module.exports = {
    insertInventory
};
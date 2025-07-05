const { NotFoundError } = require("../core/error.response");
const {inventoryModel} = require("../models/inventory.model");
const { findProductById } = require("./product.service");

class InventoryService {
    static async addStockToInventory ({
        stock,
        productId,
        shopId,
        location = '123 Nguyen Trung Anh'
    }){
        const product = findProductById(productId)
        if(! product){
            throw new NotFoundError('Khong thay product')
        }

        const query = {
            inven_shopId : shopId,
            inven_productId : productId
        },
        updateSet = {
            $inc : {
                inven_stocks : stock
            },
            $set :{
                inven_location : location
            }
        },
        option = { upsert : true, new : true}

        return await inventoryModel.updateOne(query,updateSet,option)
    }
}

module.exports = InventoryService
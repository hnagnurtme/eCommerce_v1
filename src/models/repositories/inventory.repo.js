const { create } = require("lodash");
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


const reservationInventory = async ({
    productId,quanity, cartId
}) =>{
    const query  = {
        inven_productId : convertToObjectId(productId),
        inven_stock : { $gte : quanity},  
    },
    update_set = {
        $inc : {
            inven_stock : -quanity
        },
        $push : {
            inven_reservations : {
                quanity,
                cartId,
                createOn : new Date()
            }
        }
    },
    option = {
        upsert : true,new : true
    }

    return inventoryModel.updateOne(query, update_set)

}
module.exports = {
    insertInventory,
    reservationInventory
};
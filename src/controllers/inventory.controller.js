const { OK } = require('../core/sucess.response');
const { addStockToInventory } = require('../services/inventory.service');


class InventoryController {
    addStockToInventory = async (req, res, next) => {
        return new OK({
            message :'Add stock Successfully',
            metadata : await addStockToInventory(req.body)
        }).send(res)
    }
}

module.exports = new InventoryController();
const { NotFoundError } = require('../core/error.respone')
const { productModel , clothingModel, electronicModel } = require('../models/product.model')

// define base product
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price,
        product_type, product_shop, product_attributes, product_quantity
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_quantity = product_quantity
    }

    async createProduct() {
        return await productModel.create(this)
    }
}

// define sub class
class Clothing extends Product {
    
    async createProduct() {
        const newClothing = await clothingModel.create(this.product_attributes)
 
        if (!newClothing) {
            throw new NotFoundError('Lỗi tạo clothing')
        }

        const newProduct = await super.createProduct()
        if (!newProduct) {
            throw new NotFoundError('Lỗi tạo product')
        }
        return newProduct;
    }
}

class Electronic extends Product {
    async createProduct() {
        
        const newElectronic = await electronicModel.create(this.product_attributes)
        
        if (!newElectronic) {
            throw new NotFoundError('Lỗi tạo electronic')
        }

        const newProduct = await super.createProduct()
        if (!newProduct) {
            throw new NotFoundError('Lỗi tạo product')
        }
        return newProduct;
    }
}

// Factory class
class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case 'Electronic':
                return new Electronic(payload).createProduct()
            case 'Clothing':
                return new Clothing(payload).createProduct()
            default:
                throw new NotFoundError('Sai trong switch case')
        }
    }
}

module.exports = ProductFactory

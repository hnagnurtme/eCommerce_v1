const { NotFoundError } = require('../core/error.respone')
const { productModel , clothingModel, electronicModel, furnitureModel } = require('../models/product.model')

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

    async createProduct(productId) {
        return await productModel.create({
            ...this,
            _id : productId
        })
    }
}

// define sub class
class Clothing extends Product {
    
    async createProduct() {
        const newClothing = await clothingModel.create({
            ...this.product_attributes,
            product_shop :this.product_shop
        })
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
        
        const newElectronic = await electronicModel.create({
            ...this.product_attributes,
            product_shop :this.product_shop
        })
        
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


class Furniture extends Product{
    async createProduct() {
        
        const newFurniture = await furnitureModel.create({
            ...this.product_attributes,
            product_shop :this.product_shop
        })
        
        if (!newFurniture) {
            throw new NotFoundError('Lỗi tạo furniture')
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
    static productRegistry = {} // key Class

    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
       const productClass =  ProductFactory.productRegistry[type]
       if( !productClass){
         throw new NotFoundError('Khong tim thay type')
       }

       return new productClass(payload).createProduct()
    }
}
// register productType
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory

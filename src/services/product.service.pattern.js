const { isDate } = require('lodash')
const { NotFoundError } = require('../core/error.respone')
const { productModel , clothingModel, electronicModel, furnitureModel } = require('../models/product.model')
const { findAllDraftedForShop, publishProductByShop, searchProductByUser ,findAllPublishedForShop, unPublishProductByShop} = require('../models/repositories/product.repo')

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
    // Put
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }
    /**
     * @description : Find all draft product of shop
     * @param {Number}  limit
     * @param {Number} skip
     * @return {JSON}
     */
    static async findAllDraftForShop({product_shop, limit = 50,skip = 0}){
        const query = { product_shop, isDraft : true}
        return await findAllDraftedForShop({query, limit,skip})
    }

    /**
     * 
     * @param {*} param0 
     * @returns 
     */
    static async findAllPublishForShop({product_shop, limit = 50,skip = 0}){
        const query = { product_shop, isPublished : true}
        return await findAllPublishedForShop({query, limit,skip})
    }
    
    static async searchProduct({ keySearch}) {
        return await searchProductByUser({ keySearch })
    }


}
// register productType
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory

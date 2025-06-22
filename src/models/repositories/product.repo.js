const { productModel, electronicModel, furnitureModel, clothingModel } = require('../product.model')
const { Types } = require('mongoose')
const  {getSelectData} = require('../../utils/index')
const findAllDraftedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await productModel.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if (!foundShop) {
        return null
    }
    foundShop.isDraft = false
    foundShop.isPublished = true

    await foundShop.save()

    return foundShop
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await productModel.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if (!foundShop) {
        return null
    }
    foundShop.isDraft = true
    foundShop.isPublished = false

    await foundShop.save()

    return foundShop
}

const queryProduct = async ({ query, limit, skip }) => {
    return await productModel.find(query).populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}
const searchProductByUser = async ({ keySearch, limit = 50, skip = 0 }) => {
    const regexSearch = new RegExp(keySearch)
    const result = await productModel.find({
        $text: { $search: regexSearch },
    }, {
        score: { $meta: 'textScore' }
    })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()

    return result
}

const findAllProducts = async ({ limit, sort , page,filter,select }) =>{
    const skip = (page - 1)* limit
    const sortby = sort === 'ctime' ? { _id : -1} :{ _id : 1}
    const products = await productModel.find(filter).sort(sortby).skip(skip).limit(limit).select(getSelectData(select)).lean()

    return products
}

const createProduct = async (productData) => {
    return await productModel.create(productData)
}

const createClothing = async (clothingData) => {
    return await clothingModel.create(clothingData)
}

const createElectronic = async (electronicData) => {
    return await electronicModel.create(electronicData)
}

const createFurniture = async (furnitureData) => {
    return await furnitureModel.create(furnitureData)
}

const updateProductById = async (productId, dataUpdate) => {
    return await productModel.findByIdAndUpdate(productId, dataUpdate, { new: true })
}

const updateClothingById = async (clothingId, dataUpdate) => {
    return await clothingModel.findByIdAndUpdate(clothingId, dataUpdate, { new: true })
}

const updateElectronicById = async (electronicId, dataUpdate) => {
    return await electronicModel.findByIdAndUpdate(electronicId, dataUpdate, { new: true })
}

const updateFurnitureById = async (furnitureId, dataUpdate) => {
    return await furnitureModel.findByIdAndUpdate(furnitureId, dataUpdate, { new: true })
}

const findProductById = async (productId) => {
    return await productModel.findById(productId).lean()
}

const deleteProductById = async (productId) => {
    return await productModel.findByIdAndDelete(productId)
}

const checkProductServer = async (products) => {
    const results = await Promise.all(products.map(async product => {
        const foundProduct = await findProductById(product.product_id);

        if (foundProduct) {
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.product_id
            };
        }
        // Optionally, throw an error if product not found
        // throw new Error(`Product with id ${product.product_id} not found`);
        return null;
    }));
    // Filter out null results (products not found)
    return results.filter(item => item !== null);
}
module.exports = {
    findAllDraftedForShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllPublishedForShop,
    searchProductByUser,
    findAllProducts,
    createProduct,
    createClothing,
    createElectronic,
    createFurniture,
    updateProductById,
    updateClothingById,
    updateElectronicById,
    updateFurnitureById,
    findProductById,
    deleteProductById
}
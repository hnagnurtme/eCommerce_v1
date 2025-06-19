const { productModel, electronicModel, furnitureModel, clothingModel } = require('../product.model')
const { Types } = require('mongoose')

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

module.exports = {
    findAllDraftedForShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllPublishedForShop,
    searchProductByUser
}
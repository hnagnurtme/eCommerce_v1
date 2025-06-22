const {cartModel} = require("../cart.model")

const createUserCart = async ({ userId, product }) => {
    const query = {
        cart_userId: userId,
        cart_state: 'active'
    };

    const updateOrInsert = {
        $addToSet: {
            cart_products: product
        }
    };

    const options = {
        upsert: true,
        new: true
    };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const updateCartQuantity = async ({ userId, product }) => {
    const { productId, quantity } = product;

    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
    };

    const updateSet = {
        $inc: {
            'cart_products.$.quantity': quantity
        }
    };

    const options = {
        upsert: true,
        new: true
    };

    return await cartModel.findOneAndUpdate(query, updateSet, options);
};

module.exports = {
    createUserCart,
    updateCartQuantity
}
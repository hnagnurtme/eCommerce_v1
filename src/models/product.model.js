const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'products';

const productSchema = new Schema({
  product_name: { type: String, required: true },
  product_thumb: { type: String, required: true },
  product_description: { type: String },
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: {
    type: String,
    required: true,
    enum: ['Clothing', 'Electronic'],
  },
  product_shop: { type: String },
}, {
  timestamps: true,
  collection: COLLECTION_NAME,
  discriminatorKey: 'product_type',
});

const Product = model(DOCUMENT_NAME, productSchema);

// Clothing
const clothingSchema = new Schema({
  brand: { type: String, required: true },
  size: String,
  material: String,
});

const Clothing = Product.discriminator('Clothing', clothingSchema);

// Electronic
const electronicSchema = new Schema({
  manufacturer: { type: String, required: true },
});

const Electronic = Product.discriminator('Electronic', electronicSchema);

module.exports = {
  productModel : Product,
  clothingModel : Clothing,
  electronicModel :Electronic
};

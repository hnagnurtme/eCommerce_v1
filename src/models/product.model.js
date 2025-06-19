const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

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
  product_shop: { type: Schema.Types.ObjectId , ref : 'Shop' },
  product_attributes : {
    type : Schema.Types.Mixed,
    required : true,
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME,
});

// Clothing
const clothingSchema = new Schema({
  brand: { type: String, required: true },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId , ref : 'Shop' },
}, {
  timestamps: true,
  collection: 'Clothings',
});



const electronicSchema = new Schema({
  manufacturer: { type: String, required: true },
  model : String,
  color : String,
  product_shop: { type: Schema.Types.ObjectId , ref : 'Shop' },
}, {
  timestamps: true,
  collection: 'Electronics',
});



module.exports = {
  productModel : model(DOCUMENT_NAME, productSchema),
  clothingModel : model('Clothing', clothingSchema),
  electronicModel :model('Electronic',electronicSchema)
};

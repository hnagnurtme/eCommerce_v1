const slugify = require('slugify')
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';

const productSchema = new Schema({
  product_name: { type: String, required: true },
  product_thumb: { type: String, required: true },
  product_description: { type: String },
  product_slug :{ type : String},
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: {
    type: String,
    required: true,
    enum: ['Clothing', 'Electronic','Furniture'],
  },
  product_shop: { type: Schema.Types.ObjectId , ref : 'Shop' },
  product_attributes : {
    type : Schema.Types.Mixed,
    required : true,
  },
  product_ratingsAverage :{
    type: Number,
    default : 4.5,
    min : [1, 'Rating must be above 1.0'],
    max : [5, 'Rating must be above 5.0'],

    set: (value) =>{
      Math.round(value*10) / 10
    }
  },
  product_variations:{
    type : Array,
    default :[]
  },
  isDraft : {
    type : Boolean,
    default : true,
    index : true,
    select : false,
  },
  isPublished : {
    type : Boolean,
    default : false,
    index : true,
    select : false,
  },
}, {
  timestamps: true,
  collection: COLLECTION_NAME,
});

// Indexes
productSchema.index({ product_name: 'text', product_description: 'text' });
/// document middleware : run before .save() and .create()

productSchema.pre('save', function(next){
  this.product_slug = slugify(this.product_name, { lower : true});
  next()
})


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

const furnitureSchema = new Schema({
  brand: { type: String, required: true },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId , ref : 'Shop' },
}, {
  timestamps: true,
  collection: 'Furnitures',
});

module.exports = {
  productModel : model(DOCUMENT_NAME, productSchema),
  clothingModel : model('Clothing', clothingSchema),
  electronicModel :model('Electronic',electronicSchema),
  furnitureModel : model('Furniture',furnitureSchema)
};

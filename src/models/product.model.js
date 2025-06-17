//!dmbg
const { size } = require('lodash');
const {model,Schema} = require('mongoose'); 

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'



// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
    },
    product_thumb:{
        type:String,
        required:true,
    },
    product_decription:{
        type:String,
    },
    product_price:{
        type:Number,
        required:true,
    },
    product_price:{
        type:Number,
        required:true,
    },
    product_quantity:{
        type:Number,
        required:true,
    },
    product_type:{
        type:String,
        required:true,
        enum : ['Electronic','Clothing','Furniture']
    },
    product_shop :{
        type : String
    },
    product_atributes:{
        type : Schema.Types.Mixed,
        required : true
    }
},{
    timestamps : true,
    collection : COLLECTION_NAME
}
);

// define product type = clothing
const clothingSchema = new Schema({
    brand : {
        type : String,
        required : true,
    },
    size : String,
    material : String
},{
    collection : 'clothes',
    timestamps : true,
});

// define product type = clothing
const electronicSchema = new Schema({
    manufacturer :{
        type : String,
        required : true
    }
},{
    collection : 'electronic',
    timestamps : true,
});
//Export the model
module.exports = {
    product : model(DOCUMENT_NAME, productSchema),
    clothing : model('Clothing', clothingSchema),
    electronic : model('Electronic', electronicSchema)
}
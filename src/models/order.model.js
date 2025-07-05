//!dmbg
const {model,Schema,Types} = require('mongoose');

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Oders'


const oderSchema = new Schema({
   order_userId : {
    type : Number,
    required : true
   },
   order_checkout : {
    type : Object,
    default : {}
   },
   order_shipping : {
    type : Object,
    default : {}
   },
   order_payment : {
     type : Object,
    default : {}
   },
   order_products : {
    type : Array,
    required : true
   },
   order_trackingNumber : {
    type : String,
    default : '#000101072025'
   },
   order_status : {
    type : String,
    enum : ['pending', 'confirmed','shipped','cancelled'],
    default : 'pending'
   }
},{
    collection : COLLECTION_NAME,
    timestamps : {
        createdAt : 'createdOn',
        updatedAt : 'modifiedOn'
    }
}
)

module.exports = {
    orderModel : model(DOCUMENT_NAME,oderSchema)
}
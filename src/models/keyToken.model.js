//!dmbg
const {model,Schema,Types} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

// Declare the Schema of the Mongo model
var keySchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required : true,
        ref : 'Shop'
    },
    publicKey:{
        type:String,
        required:true,
    },
    privateKey:{
        type:String,
        required:true,
    },
    refreshTokenUsed:{
        type:Array,
        default : []
    },
    refreshToken:{
        type: String,
        required : true
    },
},{
    timestamps : true,
    collection : COLLECTION_NAME
}
)
//Export the model
module.exports = model(DOCUMENT_NAME,keySchema);
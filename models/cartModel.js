const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    user : {
        type : ObjectId,
        ref:"user",
        require:true,
    },
    product:[{
        productId:{
            type: ObjectId,
            ref:"Product",
            require:true,
        },
      
        quantity:{
            type:Number,
            default:1
        },
       
    }], 
    couponDiscount:{
        type: ObjectId,
        ref:"coupon",
        default:null,
    }
})
const cartModel = mongoose.model("cart",cartSchema)
module.exports = cartModel
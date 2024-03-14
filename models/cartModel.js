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
            type:ObjectId,
            ref:"Product",
            require:true,
        },
        name:{
            type:String,
            required:true
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number,
            default:0
        },
        totalPrice:{
            type:Number,
            default:0
        },
        images:[{
            type:String 
        }]
    }],
    couponDiscount:{
        type:ObjectId,
        ref:"coupon",
        default:null,
    }
})
const cartModel = mongoose.model("cart",cartSchema)
module.exports = cartModel
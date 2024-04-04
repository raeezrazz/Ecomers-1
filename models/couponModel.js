const mongoose = require('mongoose')
const User = require ('./userModel')
const CouponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    couponCode:{
        type:String,
        required:true,
    },
    discountAmount:{
        type:Number
    },
    activationDate:{
        type:Date,
        required:true,
    },
    expiryDate:{
        type:Date,
        required:true
    },
    criteriaAmount:{
        type:Number, 
        required:true
    },
    usedUser:{
        type:Array,
        ref:"User",
        default:[]
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
})

const CouponModel = mongoose.model("coupon",CouponSchema);
module.exports = CouponModel
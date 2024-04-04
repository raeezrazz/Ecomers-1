const mongoose = require('mongoose')
const User = require('./userModel')
const OfferSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discountAmount:{
        type:Number,

    },
    activationDate:{
        type:Date,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    is_blocked:{
        type:Boolean,
        default:false
    }
})

const OfferModel = mongoose.model('offer',OfferSchema);
module.exports = OfferModel
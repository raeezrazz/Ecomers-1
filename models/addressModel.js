const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const addressSchema = new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:"User",
        required:true
    },
    address:[{
        name:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        landmark:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        district:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        phone:{
            type:Number,
            required:true
        },
        email:{
            type:String,
            required:true
        },


    }]
})
const address = mongoose.model('address',addressSchema)
module.exports=address
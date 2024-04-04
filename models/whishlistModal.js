const mongoose= require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId
  

const wishlistSchema =new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:"user",
        require:true,
    },
    products:[{
        productId:{
            type: ObjectId,
            require:true,  
            ref:"Product"
        }
    }]
})

module.exports =mongoose.model("wishlist",wishlistSchema)
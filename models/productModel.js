const mongoose=require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const productSchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    quantity:{
        type:Number,
        require: true
    },
    categoryId:{
        type: ObjectId,
        ref:'categories',
      required:true
    },
    price:{
        type: Number,
        require: true
    }, 
    offer:{
        type: String,
        require: false
    },
    description:{
        type: String,
        require: true
    },
    images:[{
        type:String 
}]
    ,
    createdAt:{
        type: Date,
        require:true
    
       },
    isCategoryBlocked:{
        type: Boolean,
        default: false
    },
    is_blocked:{
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model("Product",productSchema)
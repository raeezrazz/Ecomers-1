const mongoose =require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const orderSchema =new mongoose.Schema({
    user:{
        type: ObjectId,
        ref:'User',
        require:true
    },
    delivery_address:{
        type: Object,
        require:true

    },
    payment :{
        type: String,
        require:true,
        methode:String,
    },
    products:[{
        productId:{
            type: ObjectId,
            ref:'Product',
        require:true

        },
        quantity:{
            type: Number,
        require:true

        },
        price:{
            type: Number,
        require:true

        },
        totalPrice:{
            type:Number,
            default:0
        },
        productStatus:{
            type: String,
            default:'Placed',
            enum:['pending','Placed','deliver','cancelled','shipped','out for delivery','returned']
        },
        cancelReason:{
            type: String,
        },
        returnReason:{
            type: String
        }
    }],
    subtotal:{
        type: Number,
        require:true

   },
   orderStatus:{
    type: String,
    default:'pending',
    enum:['pending','placed','returned or cancelled']
   },
   orderDate:{
    type: Date,
    require:true

   },
   wallet:{
    type: Number
   },
   cancelledProduce: {
    type : Array,
    default: []
   },
   returnedProduct:{
    type: Array,
    default:[]
   }
})

const Order = mongoose.model('Orders',orderSchema)
module.exports = Order
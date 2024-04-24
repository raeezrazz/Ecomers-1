const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    
    
 name:{
    type: String,
    required:true
},
email:{
    type :String,
    required:true
},
mobile:{
    type:Number,
    required:true       
},
password:{
    type:String,
    required:true

},
// image:{
//     type:String, 
//     required:true

// },
is_admin:{
    type:Number,
    required:true
},
wallet:{
    type:Number,
    default:0
},
walletHistory:[{
    date:{
        type:Date

    },
    amount:{
        type:Number
    },
}]
,

is_varified:{
    type:Number,
    default:0
},
is_blocked:{
    type:Boolean,
    default:false
},
referalCode:{
    type:Number,
    
}

});


module.exports = mongoose.model('User',userSchema)
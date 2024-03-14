const mongoose = require("mongoose");
 const categorySchema = mongoose.Schema({
name:{
    type: String,
    require:true,
    unique:true
},
is_deleted:{
    type: Boolean,
    default: false
}


})
module.exports = mongoose.model("categories",categorySchema);
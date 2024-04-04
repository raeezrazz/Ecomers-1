const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    offer: {
        type: ObjectId,
        ref: 'offer',
        required: false
    },
    is_deleted: {
        type: Boolean,
        default: false
    }


})
module.exports = mongoose.model("categories", categorySchema);
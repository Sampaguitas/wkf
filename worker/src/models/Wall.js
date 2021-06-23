const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WallSchema = new Schema({
    "sizeId": Number,
    "mm": Number,
    "inch": Number,
    "idt": String,
    "sch": String,
    "schS": String,
    "lunar": String,
    "tags": [String],
    "pffTypes": [String]
},
{
    "timestamps": true
});

module.exports = Wall = mongoose.model("walls", WallSchema);
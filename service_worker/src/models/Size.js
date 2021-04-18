const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SizeSchema = new Schema({
    "nps": String,
    "dn": String,
    "mm": Number,
    "in": Number,
    "lunar": String,
    "tags": [String],
    "pffTypes": [String]
},
{
    "timestamps": true
});

module.exports = Size = mongoose.model("sizes", SizeSchema);
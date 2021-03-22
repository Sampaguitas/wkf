const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EndSchema = new Schema({
    "lunar": String,
    "name": String,
    "tags": [String],
    "pffTypes": [String]
},
{
    "timestamps": true
});

module.exports = End = mongoose.model("ends", EndSchema);
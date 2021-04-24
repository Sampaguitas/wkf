const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LengthSchema = new Schema({
    "lunar": String,
    "name": String,
    "tags": [String],
    "pffTypes": [String]
},
{
    "timestamps": true
});

module.exports = Length = mongoose.model("lengths", LengthSchema);
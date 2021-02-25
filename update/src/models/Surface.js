const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SurfaceSchema = new Schema({
    "lunar": String,
    "name": String,
    "tags": [String],
    "pffTypes": [String]
},
{
    "timestamps": true
});

module.exports = Surface = mongoose.model("surfaces", SurfaceSchema);
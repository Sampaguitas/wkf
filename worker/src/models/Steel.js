const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SteelSchema = new Schema({
    "name": String,
},
{
    "timestamps": true
});

module.exports = Steel = mongoose.model("steels", SteelSchema);
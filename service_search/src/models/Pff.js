const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PffSchema = new Schema({
    "name": String,
},
{
    "timestamps": true
});

module.exports = Pff = mongoose.model("pffs", PffSchema);
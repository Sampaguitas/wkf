const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ParamSchema = new Schema({
    "artNr": String,
    "description": String,
    "vlunar": String,
    "weight": Number,
    "uom": String,
    "parameters": {
        "sizeOne": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "sizeTwo": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "sizeThree": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "wallOne": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "wallTwo": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "type": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "pffType": String
        },
        "grade": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "steelType": String
        },
        "length": {
            "lunar": String,
            "name": String,
            "tags": [String]
        },
        "end": {
            "lunar": String,
            "name": String,
            "tags": [String]
        }
    }
},
{
    timestamps: true
});

module.exports= Param = mongoose.model("params", ParamSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const _ = require("lodash");

const ParamSchema = new Schema({
    "artNr": String,
    "description": String,
    "vlunar": String,
    "weight": Number,
    "uom": String,
    "parameters": {
        "sizeOne": {
            "name": String,
            "tags": [String]
        },
        "sizeTwo": {
            "name": String,
            "tags": [String]
        },
        "sizeThree": {
            "name": String,
            "tags": [String]
        },
        "wallOne": {
            "name": String,
            "tags": [String]
        },
        "wallTwo": {
            "name": String,
            "tags": [String]
        },
        "type": {
            "name": String,
            "tags": [String]
        },
        "grade": {
            "name": String,
            "tags": [String]
        },
        "length": {
            "name": String,
            "tags": [String]
        },
        "end": {
            "name": String,
            "tags": [String]
        }
    }
},
{
    timestamps: true
});

module.exports= Param = mongoose.model("params", ParamSchema);
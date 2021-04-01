const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExportSchema = new Schema({
    "type": String, //stock or params
    "system": {
        "type": String,
        "default": "METRIC"
    },
    "stockFilters": {
        "filter": {
            "opco": String,
            "artNr": String,
            "description": String,
            "qty": String,
            "uom": String,
            "firstInStock": String,
            "weight": String,
            "gip": String,
            "currency": String,
            "rv": String
        },
        "dropdown": {
            "opco": String,
            "pffType": String,
            "steelType": String,
            "sizeOne": String,
            "sizeTwo": String,
            "wallOne": String,
            "wallTwo": String,
            "type": String,
            "grade": String,
            "length": String,
            "end": String,
            "surface": String
        },
        "sort": {
            "name": String,
            "isAscending": {
                "type": Boolean,
                "default": true
            },
        },
    },
    "items": {
        "type": Number,
        "default": 0
    },
    "status": String,
    "userId": String,
},
{
    "timestamps": true
});

module.exports = Export = mongoose.model('exports', ExportSchema);
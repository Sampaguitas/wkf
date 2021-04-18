const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExportSchema = new Schema({
    "type": {
        "type": String,
     }, //stock or params
    "system": {
        "type": String,
        "default": "METRIC"
    },
    "stockFilters": {
        "filter": {
            "opco": {
                "type": String
            },
            "artNr": {
                "type": String
            },
            "description": {
                "type": String
            },
            "qty": {
                "type": Number,
            },
            "firstInStock": {
                "type": Number,
            },
            "uom": {
                "type": String
            },
            "gip": {
                "type": Number,
            },
            "rv": {
                "type": Number,
            },
            "currency": {
                "type": String
            },
        },
        "dropdown": {
            "opco": {
                "type": String,
            },
            "pffType": {
                "type": String,
            },
            "steelType": {
                "type": String,
            },
            "sizeOne": {
                "type": String,
            },
            "sizeTwo": {
                "type": String,
            },
            "wallOne": {
                "type": String,
            },
            "wallTwo": {
                "type": String,
            },
            "type": {
                "type": String,
            },
            "grade": {
                "type": String,
            },
            "length": {
                "type": String,
            },
            "end": {
                "type": String,
            },
            "surface": {
                "type": String,
            },
        },
        "sort": {
            "name": {
                "type": String,
            },
            "isAscending": {
                "type": Boolean,
                "default": true
            },
        },
    },
    "status": {
        "type": String,
    },
    "createdBy": {
        "type": mongoose.ObjectId,
        "ref": "users"
    },
    "expiresAt": {
        "type": Date,
        "default": function() {
            var today = new Date();
           return new Date(today.setDate(today.getDate() + 7));
       }
    }
},
{
    "timestamps": true
});

module.exports = Export = mongoose.model('exports', ExportSchema);
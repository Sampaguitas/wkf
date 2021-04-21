const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExportSchema = new Schema({
    "type": {
        "type": String,
     },
    "stockFilters": {
        "dropdown": {
            "opco": {
                "type": String,
            },
            "artNr": {
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
        "selectedIds": [{
            "type": mongoose.ObjectId,
            "ref": "stocks"
        }]
    },
    "status": {
        "type": String,
    },
    "lines": {
        "type": Number,
        "default": 0
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
    },
    "accountId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "accounts"
    }
},
{
    "timestamps": true
});

module.exports = Export = mongoose.model('exports', ExportSchema);
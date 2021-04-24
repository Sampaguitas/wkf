const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImportSchema = new Schema({
    "type": {
        "type": String,
    },
    "system": {
        "type": String,
    },
    "currency": {
        "type": String,
    },
    "opco": {
        "type": String,
    },
    "message": {
        "type": String,
    },
    "rejections": [{
        "row": {
            "type": Number
        },
        "reason": {
            "type": String
        },
    }],
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

module.exports = Import = mongoose.model('imports', ImportSchema);
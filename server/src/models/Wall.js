const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WallSchema = new Schema({
    "sizeId": {
        "type": Number
    },
    "mm": {
        "type": Number
    },
    "inch": {
        "type": Number
    },
    "idt": {
        "type": String
    },
    "sch": {
        "type": String
    },
    "schS": {
        "type": String
    },
    "lunar": {
        "type": String
    },
    "tags": [{
        "type": String
    }],
    "pffTypes": [{
        "type": String
    }],
    "createdBy": {
        "type": mongoose.SchemaTypes.ObjectId,
        "ref": "users"
    },
    "updatedBy": {
        "type": mongoose.SchemaTypes.ObjectId,
        "ref": "users"
    }
},
{
    "timestamps": true
});

module.exports = Wall = mongoose.model("walls", WallSchema);
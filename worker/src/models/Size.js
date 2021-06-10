const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SizeSchema = new Schema({
    "lunar": {
        "type": String
    },
    "nps": {
        "type": String
    },
    "dn": {
        "type": String
    },
    "mm": {
        "type": Number
    },
    "in": {
        "type": Number
    },
    "pffTypes": [{
        "type": String
    }],
    "tags": [{
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

module.exports = Size = mongoose.model("sizes", SizeSchema);
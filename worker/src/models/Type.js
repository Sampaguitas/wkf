const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
    "lunar": {
        "type": String
    },
    "name": {
        "type": String
    },
    "tags": [{
        "type": String
    }],
    "pffType": {
        "type": String
    },
    "specs": [{
        "type": String
    }],
    "isComplete": {
        "type": Boolean
    },
    "isMultiple": {
        "type": Boolean
    },
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

module.exports = Type = mongoose.model("types", TypeSchema);
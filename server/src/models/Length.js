const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LengthSchema = new Schema({
    "lunar": {
        "type": String
    },
    "name": {
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

module.exports = Length = mongoose.model("lengths", LengthSchema);
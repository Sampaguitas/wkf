const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SteelSchema = new Schema({
    "name": {
        "type": String
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

module.exports = Steel = mongoose.model("steels", SteelSchema);
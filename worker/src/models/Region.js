const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegionSchema = new Schema({
    "name": {
        "type": String,
        "required": true
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

module.exports = Region = mongoose.model("regions", RegionSchema);
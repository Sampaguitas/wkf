const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchSchema = new Schema({
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

module.exports = Sch = mongoose.model("schs", SchSchema);
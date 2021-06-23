const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SchsShema = new Schema({
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

module.exports = Schs_s = mongoose.model("schs_s", SchsShema);
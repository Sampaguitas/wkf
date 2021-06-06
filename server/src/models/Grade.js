const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GradeSchema = new Schema({
    "lunar": {
        "type": String
    },
    "name": {
        "type": String
    },
    "tags": [{
        "type": String
    }],
    "steelType": {
        "type": String
    },
    "pffTypes": [{
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

module.exports = Grade = mongoose.model("grades", GradeSchema);
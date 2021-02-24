const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GradeSchema = new Schema({
    "lunar": String,
    "name": String,
    "tags": [String],
    "steelType": String,
    "pffTypes": [String],
    "isComplete": Boolean,
    "isMultiple": Boolean
},
{
    "timestamps": true
});

module.exports = Grade = mongoose.model("grades", GradeSchema);
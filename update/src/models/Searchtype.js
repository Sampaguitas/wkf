const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchtypeSchema = new Schema({
    "minSize": Number,
    "maxSize": Number,
    "types": [String],
    "value": {
        "lunar": String,
        "name": String,
        "tags": [String],
        "pffType": String,
    }
},
{
    "timestamps": true
});

module.exports = Searchtype = mongoose.model("searchtypes", SearchtypeSchema);
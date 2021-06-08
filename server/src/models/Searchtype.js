const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchtypeSchema = new Schema({
    "value": {
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
    },
    "types": [{
        "type": String
    }],
    "minSize": {
        "type": Number
    },
    "maxSize": {
        "type": Number
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

module.exports = Searchtype = mongoose.model("searchtypes", SearchtypeSchema);
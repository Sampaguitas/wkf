const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    "userName": {
        type: String,
        required: true
    },
    "name": {
        type: String,
        required: true
    },
    "email": {
        type: String,
        required: true
    },
    "password": {
        type: String,
        required: true,
        select: false
    },
    "isAdmin":{
        type: Boolean,
        default: false
    }
},
{
    "timestamps": true
});

module.exports= User = mongoose.model("users", UserSchema);
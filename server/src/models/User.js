const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    "name": {
        type: String,
        required: true
    },
    "email": {
        type: String,
        unique: true,
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
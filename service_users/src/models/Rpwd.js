const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RpwdSchema = new Schema({
    "userId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "users"
    },
    "token": {
        type: String,
    },
    "expire":{
        type: Date,
    },
    "status":{
        type: Number,
        default: 0,
    }
});

module.exports= Rpwd = mongoose.model("rpwds", RpwdSchema);



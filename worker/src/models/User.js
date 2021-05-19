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
    },
    "currency":{
        type: String,
        default: "EUR"
    },
    "system":{
        type: String,
        default: "METRIC"
    },
    "accountId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "accounts"
    }
},
{
    "timestamps": true
});

UserSchema.virtual("account", {
    ref: "accounts",
    localField: "accountId",
    foreignField: "_id",
    justOne: true
});

UserSchema.set('toJSON', { virtuals: true });

module.exports= User = mongoose.model("users", UserSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    "name": String,
    "uploadKey": String,
},
{
    "timestamps": true
});

AccountSchema.virtual("opcos", {
    ref: "opcos",
    localField: "_id",
    foreignField: "accountId",
    justOne: false
});

AccountSchema.set('toJSON', { virtuals: true });

module.exports = Account = mongoose.model("accounts", AccountSchema);
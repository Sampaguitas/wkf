const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
    "name": {
        "type": String,
        "required": true
    },
    "regionId": {
        "type": mongoose.SchemaTypes.ObjectId,
        "ref": "regions",
        "required": true
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
    "timestamps": true,
    "toJSON": { "virtuals": true }
});

CountrySchema.virtual("region", {
    ref: "regions",
    localField: "regionId",
    foreignField: "_id",
    justOne: true
});

module.exports= Country = mongoose.model("countries", CountrySchema);
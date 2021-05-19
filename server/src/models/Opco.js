const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OpcoSchema = new Schema({
    "title": {
        type: String
    },
    "address": {
        type: String
    },
    "postalcode": {
        type: String
    },
    "city": {
        type: String
    },
    "tel": {
        type: String
    },
    "fax": {
        type: String
    },
    "email": {
        type: String
    },
    "countryId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "countries"
    },
    "stockInfo": {
        "esm_id": {
            type: Number
        },
        "name": {
            type: String
        },
        "abbreviation": {
            type: String
        },
        "stock_file_code": {
            type: String
        },
        "currency_cost_prices": {
            type: String
        },
        "intercompany_price_information": {
            type: String
        },
        "status_id": {
            type: Boolean
        },
        "capex_file_code": {
            type: String
        },
        "system": {
            type: String
        },
    },
    "accountId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "accounts"
    }
},
{
    "timestamps": true,
    "toJSON": { "virtuals": true }
});

OpcoSchema.virtual("country", {
    ref: "countries",
    localField: "countryId",
    foreignField: "_id",
    justOne: true
});

module.exports = Opco = mongoose.model("opcos", OpcoSchema);
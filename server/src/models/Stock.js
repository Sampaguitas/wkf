const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockSchema = new Schema({
    "opco": String,
    "artNr": String,
    "description": String,
    "vlunar": String,
    "weight": Number,
    "uom": String,
    "qty": Number,
    "price": {
        "gip": Number,
        "rv": Number,
    },
    "purchase": {
        "supplier": String,
        "qty": Number,
        "firstInStock": Number,
        "deliveryDate": Date
    },
    "supplier": {
        "names": [String],
        "qtys": [Number]
    },
    "parameters": {
        "sizeOne": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "sizeTwo": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "sizeThree": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "wallOne": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "wallTwo": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "mm": Number
        },
        "type": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "pffType": String
        },
        "grade": {
            "lunar": String,
            "name": String,
            "tags": [String],
            "steelType": String
        },
        "length": {
            "lunar": String,
            "name": String,
            "tags": [String]
        },
        "end": {
            "lunar": String,
            "name": String,
            "tags": [String]
        },
        "surface": {
            "lunar": String,
            "name": String,
            "tags": [String]
        }
    },
    "accountId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "accounts"
    },
    "regionId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "regions"
    },
    "countryId": {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "countries"
    }
},
{
    timestamps: true
});

StockSchema.virtual("location", {
    ref: "opcos",
    localField: "opco",
    foreignField: "stockInfo.capex_file_code",
    justOne: true
});

StockSchema.set('toJSON', { virtuals: true });

module.exports = Stock = mongoose.model("stocks", StockSchema);
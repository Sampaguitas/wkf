const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockSchema = new Schema({
    "artNr": String,
    "opco": String,
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
        "qtys": [String]
    }
},
{
    timestamps: true
});

module.exports = Stock = mongoose.model("stocks", StockSchema);
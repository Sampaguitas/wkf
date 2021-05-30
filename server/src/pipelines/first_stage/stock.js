const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (myMatch, accountId) => {
    return [
        {
            "$match": { "accountId": ObjectId(accountId) }
        },
        {
            "$match": myMatch
        },
        {
            "$project": {
                "_id": 1,
                "opco": 1,
                "artNr": 1,
                "description": 1,
                "qty": 1,
                "firstInStock": "$purchase.firstInStock",
                "supplierNames": "$supplier.names",
                "uom": 1,
                "gip": "$price.gip",
                "rv": "$price.rv",
                "parameters": 1,
                "regionId": 1,
                "countryId": 1,
            },


        },
    ]
}
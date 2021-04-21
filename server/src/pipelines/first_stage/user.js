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
            "$addFields": {
                "isAdminX": { "$toString": "$isAdmin" }
            }
        }
    ];
}
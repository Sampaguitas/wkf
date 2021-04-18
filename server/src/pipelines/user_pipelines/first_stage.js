const escape = require("../../functions/escape");
const filterBool = require("../../functions/filterBool");

module.exports = (filter) => {
    return [
        {
            "$addFields": {
                "isAdminX": { "$toString": "$isAdmin" }
            }
        },
        {
            "$match": matchFilter(filter)
        }
    ];
}

function matchFilter(filter) {
    return {
        "name" : { $regex: new RegExp(escape(filter.name),"i") },
        "email" : { $regex: new RegExp(escape(filter.email),"i") },
        "isAdmin": { $in: filterBool(filter.isAdmin)},
    }
}
module.exports = (filter, format) => {
    return [
        {
            "$lookup": {
                "from": "users",
                "localField": "createdBy",
                "foreignField": "_id",
                "as": "user"
            }
        },
        {
            "$addFields": { "user": { "$arrayElemAt": ["$user", 0] } }
        },
        {
            "$project": {
                "type": 1,
                "status": 1,
                "user": "$user.name",
                "createdAt": 1,
                "expiresAt": 1,
                "createdAtX": { "$dateToString": { format, "date": "$createdAt" } },
                "expiresAtX": { "$dateToString": { format, "date": "$expiresAt" } }
            }
        },
        {
            "$match": matchFilter(filter)
        }
    ];
}

function matchFilter(filter) {
    return {
        "type" : { $regex: new RegExp(require("../../functions/escape")(filter.type),"i") },
        "status" : { $regex: new RegExp(require("../../functions/escape")(filter.status),"i") },
        "user" : { $regex: new RegExp(require("../../functions/escape")(filter.user),"i") },
        "createdAtX" : { $regex: new RegExp(require("../../functions/escape")(filter.createdAt),"i") },
        "expiresAtX" : { $regex: new RegExp(require("../../functions/escape")(filter.expiresAt),"i") },
    }
}
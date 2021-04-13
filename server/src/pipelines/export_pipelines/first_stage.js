module.exports = (filter, format) => {
    return [
        {
            "$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "name",
                "as": "user"
            }
        },
        {
            "$project": {
                "type": 1,
                "status": 1,
                "user": "$user.name",
                "createdAtX": { "$dateToString": { format, "date": "$createdAt" } }
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
    }
}
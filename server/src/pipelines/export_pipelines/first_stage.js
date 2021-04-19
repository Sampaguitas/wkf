module.exports = (myMatch, format) => {
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
            "$match": myMatch
        }
    ];
}
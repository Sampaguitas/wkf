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
                "type": {
                    "$cond": {
                        "if": {"$eq": ["$type", "stocks"]},
                        "then": { "$concat": ["$type", " (", "$opco", ")"] },
                        "else": "$type" 
                    }
                },
                "status": 1,
                "message": 1,
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
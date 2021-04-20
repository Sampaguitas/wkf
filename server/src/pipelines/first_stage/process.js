module.exports = (myMatch, format) => {
    return [
        {
            "$project": {
                "_id": 1,
                "user": 1,
                "processType": 1,
                "createdAt": 1,
                "createdAtX": { "$dateToString": { format, "date": "$createdAt" } },
                "message": 1,
            }
        },
        {
            "$match": myMatch
        }
    ];
}
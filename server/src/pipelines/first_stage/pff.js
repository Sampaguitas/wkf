module.exports = (myMatch, format) => {
    return [
        {
            "$addFields": {
                "createdAt": { "$dateToString": { format, "date": "$createdAt"} },
                "updatedAt": { "$dateToString": { format, "date": "$updatedAt"} },
            }
        },
        {
            "$match": myMatch
        },
        {
            "$project": {
                "name": 1,
                "createdBy": 1,
                "updatedBy": 1,
                "createdAt": 1,
                "updatedAt": 1
            }
        },
    ];
}
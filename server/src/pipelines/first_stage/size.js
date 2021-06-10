module.exports = (myMatch, format) => {
    return [
        {
            "$addFields": {
                "createdAt": { "$dateToString": { format, "date": "$createdAt"} },
                "updatedAt": { "$dateToString": { format, "date": "$updatedAt"} },
                "mm": { "$toString": "$mm" }
            }
        },
        {
            "$match": myMatch
        }
    ];
}
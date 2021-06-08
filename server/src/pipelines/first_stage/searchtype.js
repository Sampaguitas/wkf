module.exports = (myMatch, format) => {
    return [
        {
            "$addFields": {
                "createdAt": { "$dateToString": { format, "date": "$createdAt"} },
                "updatedAt": { "$dateToString": { format, "date": "$updatedAt"} },
                "minSize": { "$toString": "$minSize" },
                "maxSize": { "$toString": "$maxSize" },
            }
        },
        {
            "$match": myMatch
        },
    ];
}
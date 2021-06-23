module.exports = (myMatch, format) => {
    return [
        {
            "$addFields": {
                "createdAt": { "$dateToString": { format, "date": "$createdAt"} },
                "updatedAt": { "$dateToString": { format, "date": "$updatedAt"} },
                "mmX": { "$toString": "$mm" },
                "inchX": { "$toString": "$inch" }
            }
        },
        {
            "$match": myMatch
        }
    ];
}
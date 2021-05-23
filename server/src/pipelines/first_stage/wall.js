module.exports = (myMatch, format) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$addFields": {
                "sizeIdX": { "$toString": "$sizeId" }
            }
        },
        {
            "$project": {
                "createdAt": 0,
                "updatedAt": 0,
            }
        },
    ];
}
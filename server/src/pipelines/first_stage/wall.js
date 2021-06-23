module.exports = (myMatch, format) => {
    return [
        {
            "$addFields": {
                "createdAt": { "$dateToString": { format, "date": "$createdAt"} },
                "updatedAt": { "$dateToString": { format, "date": "$updatedAt"} },
                "sizeIdX": { "$toString": "$sizeId" },
                "mmX": { "$toString": "$mm" }
            }
        },
        {
            "$match": myMatch
        },
        // {
        //     "$addFields": {
        //         "sizeIdX": { "$toString": "$sizeId" }
        //     }
        // },
        // {
        //     "$project": {
        //         "createdAt": 0,
        //         "updatedAt": 0,
        //     }
        // },
    ];
}
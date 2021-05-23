module.exports = (myMatch, format) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "createdAt": 0,
                "updatedAt": 0,
            }
        },
    ];
}
module.exports = (myMatch, format) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "createdAt": 0,
                "updatedAt": 0,
                "nps": 0,
                "dn": 0,
                "in": 0
            }
        },
    ];
}
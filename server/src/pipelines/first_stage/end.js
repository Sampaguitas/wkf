module.exports = (myMatch, format) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$project": {
                "lunar": 1,
                "name": 1,
                "tags": 1,
                "pffTypes": 1,
            }
        },
        
    ];
}
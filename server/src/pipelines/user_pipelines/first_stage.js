module.exports = (myMatch) => {
    return [
        {
            "$match": myMatch
        },
        {
            "$addFields": {
                "isAdminX": { "$toString": "$isAdmin" }
            }
        }
    ];
}
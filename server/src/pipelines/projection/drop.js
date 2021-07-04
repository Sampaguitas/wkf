const escapeBegin = require("../../functions/escapeBegin");
const escapeContain = require("../../functions/escapeContain");

module.exports = (name, page, selectionArray, contain) => {
    
    if (!selectionArray) selectionArray = [];

    return [
        {
            "$match": {
                "_id": { "$ne": "" },
                "name": { "$regex": new RegExp(!!contain ? escapeContain(name) : escapeBegin(name),"i") }
            }
        },
        {
            "$match": {
                "name": { "$nin": selectionArray }
            }
        },
        {
            "$sort": {
                "name": 1
            }
        },
        {
            "$limit": 10 + (10 * page)
        },
        {
            "$skip": 10 * page
        },
    ];
}

const escape = require("../../functions/escape");

module.exports = (name, page) => {
    return [
        {
            "$unwind": "$data"
        },
        {
            "$match": {
                "data": { "$regex": new RegExp(escape(name),"i") }
            }
        },
        {
            "$sort": {
                "data": 1
            }
        },
        {
            "$skip": 10 * page
        },
        {
            "$limit": 10
        },
        {
            "$group": {
                "_id": null,
                "data":{ "$push": `$data`}
            }
        },
        {
            "$project":{
                "_id": 0
            }
        }
    ];
}

const escape = require("../../functions/escape");

module.exports = (name, page) => {
    return [
        // {
        //     "$unwind": "$data"
        // },
        {
            "$match": {
                "name": { "$regex": new RegExp(escape(name),"i") }
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
        // {
        //     "$group": {
        //         "_id": null,
        //         "data":{ "$push": `$data`}
        //     }
        // },
        // {
        //     "$project":{
        //         "_id": 0
        //     }
        // }
    ];
}

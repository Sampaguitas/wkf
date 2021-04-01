const User = require("../models/User");
const projectionResult = require("../projections/projection_result");

const getById = (req, res, next) => {

    const {userId} = req.params;

    User.findById(userId, function (err, user) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!user) {
            res.status(400).json({ message: "Could not retrieve user information." });
        } else {
            res.json({user: user});
        }
    });
}


const getAll = (req, res, next) => {
    
    const { filter, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    User.aggregate([
            {
                $facet: {
                    "data": [
                        { "$match": myMatch(filter) },
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "name"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        { "$limit": pageSize },
                        {
                            "$project": {
                                "_id": "$_id",
                                "name": "$name",
                                "email": "$email",
                                "isAdmin": "$isAdmin",
                            }
                        }
                    ],
                    "pagination": [
                        { "$match": myMatch(filter) },
                        { "$count": "totalItems" },
                        {
                            "$addFields": {
                                "nextPage": nextPage,
                                "pageSize": pageSize
                                
                            }
                        }
                    ]
                }
            },
            {
                "$project": projectionResult(nextPage, pageSize)
            }
    ]).exec(function(error, result) {
        if (!!error || !result) {
            res.status(200).json([])
        } else {
            res.status(200).json(result)
        } 
    });
}

function myMatch(filter) {
    return {
        "name" : { $regex: new RegExp(require("../functions/escape")(filter.name),"i") },
        "email" : { $regex: new RegExp(require("../functions/escape")(filter.email),"i") },
        "isAdmin": { $in: require("../functions/filterBool")(filter.isAdmin)},
    } 
}

const userController = {
    getAll,
    getById
};

module.exports = userController;
const Process = require("../models/Process");
const projectionResult = require("../pipelines/projections/projection_result");

const getById = (req, res, next) => {

    const {processId} = req.params;

    Process.findById(processId, function (err, user) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!user) {
            res.status(400).json({ message: "Could not retrieve process information." });
        } else {
            res.json({user: user});
        }
    });
}


const getAll = (req, res, next) => {
    
    const { filter, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');

    Process.aggregate([
            {
                $facet: {
                    "data": [
                        { "$addFields": { "createdAtX": { "$dateToString": { format, "date": "$createdAt" } }  } },
                        { "$match": myMatch(filter) },
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "createdAt"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        { "$limit": pageSize },
                        {
                            "$project": {
                                "_id": "$_id",
                                "user": "$user",
                                "processType": "$processType",
                                "createdAt": "$createdAt",
                                "message": "$message",
                            }
                        }
                    ],
                    "pagination": [
                        { "$addFields": { "createdAtX": { "$dateToString": { format, "date": "$createdAt" } }  } },
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
        "user" : { $regex: new RegExp(require("../functions/escape")(filter.user),"i") },
        "processType" : { $regex: new RegExp(require("../functions/escape")(filter.processType),"i") },
        "createdAtX" : { $regex: new RegExp(require("../functions/escape")(filter.createdAt),"i") },
        "message": { $regex: new RegExp(require("../functions/escape")(filter.message),"i") },
    }
}

const userController = {
    getAll,
    getById
};

module.exports = userController;
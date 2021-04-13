const Export = require("../models/Export");
const projectionResult = require("../pipelines/projections/projection_result");
const firstStage = require("../pipelines/export_pipelines/first_stage")
const getById = (req, res, next) => {

    const {exportId} = req.params;

    Export.findById(exportId, function (err, doc) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!doc) {
            res.status(400).json({ message: "Could not retrieve process information." });
        } else {
            res.json({doc: doc});
        }
    });
}

const getAll = (req, res, next) => {
    
    const { filter, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');

    Export.aggregate([
            {
                $facet: {
                    "data": [
                        ...firstStage(filter, format),
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
                                "itemsX": 0,
                                "createdAtX": 0
                            }
                        }
                    ],
                    "pagination": [
                        ...firstStage(filter, format),
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

const exportController = {
    getAll,
    getById
};

module.exports = exportController;
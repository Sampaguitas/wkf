var aws = require('aws-sdk');
var path = require('path');

const Export = require("../models/Export");
const projectionResult = require("../pipelines/projections/projection_result");
const projectionDropSorted = require("../pipelines/projections/projection_drop_sorted");
const firstStage = require("../pipelines/export_pipelines/first_stage");

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

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
                        { "$limit": pageSize }
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

const getDrop = (req, res, next) => {
    const { filter, name } = req.body;
    let page = req.body.page || 0;
    const {key} = req.params;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    
    console.log("key:", key);
    switch(key) {
        case "type":
        case "status":
        case "user":
            Export.aggregate([
                ...firstStage(filter, format),
                {
                    "$group": {
                        "_id": null,
                        "data":{ "$addToSet": `$${key}`}
                    }
                },
                ...projectionDropSorted(name, page)
            ]).exec(function(error, result) {
                if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                    res.status(200).json([]);
                } else {
                    res.status(200).json(result[0].data);
                } 
            });
            break;
        case "expiresAt":
        case "createdAt":
            Export.aggregate([
                ...firstStage(filter, format),
                {
                    "$group": {
                        "_id": null,
                        "data":{ "$addToSet": `$${key}X`}
                    }
                },
                ...projectionDropSorted(name, page)
            ]).exec(function(error, result) {
                if (!!error || result.length !== 1 || !result[0].hasOwnProperty("data")) {
                    res.status(200).json([]);
                } else {
                    res.status(200).json(result[0].data);
                } 
            });
            break;
        default: res.status(200).json([]);
    }
}

const download = (req, res, next) => {
    const {exportId} = req.params;
    Export.findById(exportId, function(err, document) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."});
        } else if (!document) {
            res.status(400).json({ message: "Could not find the document."});
        } else {
            var s3 = new aws.S3();
            s3.getObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: path.join('exports', `${document._id}.xlsx`)
            }).createReadStream()
            .on('error', () => {
                res.status(400).json({message: "The file could not be located."});
            }).pipe(res);
        }
    });
}

const exportController = {
    getAll,
    getById,
    download,
    getDrop
};

module.exports = exportController;
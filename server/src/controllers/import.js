const bcrypt = require("bcrypt");
const aws = require('aws-sdk');
const path = require('path');
const mongoose = require("mongoose")

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

const getById = (req, res, next) => {

    const {importId} = req.params;

    require("../models/Import").findById(importId, function (err, doc) {
        if (!!err) {
            res.status(400).json({ message: "An error has occured."})
        } if (!doc) {
            res.status(400).json({ message: "Could not retrieve import information." });
        } else {
            res.json({doc: doc});
        }
    });
}

const getAll = (req, res, next) => {
    
    const { dropdown, sort } = req.body;
    const nextPage = req.body.nextPage || 1;
    const pageSize = req.body.pageSize || 20;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.type, dropdown.status, dropdown.user, dropdown.createdAt, dropdown.expiresAt).then(myMatch => {
        require("../models/Import").aggregate([
            {
                $facet: {
                    "data": [
                        ...require("../pipelines/first_stage/import")(myMatch, format),
                        {
                            "$sort": {
                                [!!sort.name ? sort.name : "createdAt"]: sort.isAscending === false ? -1 : 1,
                                "_id": 1
                            }
                        },
                        { "$limit": pageSize + ((nextPage - 1) * pageSize) },
                        { "$skip": ((nextPage - 1) * pageSize) },
                        
                    ],
                    "pagination": [
                        ...require("../pipelines/first_stage/import")(myMatch, format),
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
                "$project": require("../pipelines/projection/result")(nextPage, pageSize)
            }
        ]).exec(function(error, result) {
            if (!!error || !result) {
                res.status(200).json([])
            } else {
                res.status(200).json(result)
            } 
        });
    });
}

const getDrop = (req, res, next) => {
    const { dropdown, name } = req.body;
    let page = req.body.page || 0;
    const {key} = req.params;

    const dateFormat = req.body.dateFormat || "DD/MM/YYYY"
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');
    matchDropdown(dropdown.type, dropdown.status, dropdown.user, dropdown.createdAt, dropdown.expiresAt).then(myMatch => {
        switch(key) {
            case "type":
            case "status":
            case "user":
                require("../models/Import").aggregate([
                    ...require("../pipelines/first_stage/import")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}`,
                            "name": {"$first":`$$ROOT.${key}`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    }
                });
                break;
            case "expiresAt":
            case "createdAt":
                require("../models/Import").aggregate([
                    ...require("../pipelines/first_stage/import")(myMatch, format),
                    {
                        "$group": {
                            "_id": `$${key}X`,
                            "name": {"$first":`$$ROOT.${key}X`},
                        }
                    },
                    ...require("../pipelines/projection/drop")(name, page)
                ]).exec(function(error, result) {
                    if (!!error || !result) {
                        res.status(200).json([])
                    } else {
                        res.status(200).json(result)
                    }
                });
                break;
            default: res.status(200).json([]);
        }
    });
    
}

const uploadStock = (req, res, next) => {
    const file = req.file;
    const { email, key, opco } = req.body;
    if (!email || !key || !opco || !file) {
        res.status(400).json({ message: "Fields are missing."});  
    } else if (path.extname(file.originalname) !== ".txt") {
        res.status(400).json({ message: "Wrong file format." }); 
    } else {
        require("../models/User")
        .findOne({ email })
        .populate({ path: "account", populate: { path: "opcos", match: { "stockInfo.capex_file_code": opco } } })
        .exec(function(err, user) {
            if (!!err || !user) { 
                res.status(400).json({ message: "User not found." });
            } else if (!user.isAdmin || !user.account || !user.account.uploadKey || user.account.opcos.length === 0) { 
                res.status(401).send("Unauthorized");
            } else {
                let { system, currency_cost_prices, capex_file_code } = user.account.opcos[0].stockInfo;
                if ( !system || !currency_cost_prices || !capex_file_code ) {
                    res.status(400).json({ message: "Check stock information information." });
                } else {
                    bcrypt.compare(key, user.account.uploadKey).then(isMatch => {
                        if (!isMatch) {
                            res.status(401).send("Unauthorized");
                        } else {
                            let timestamp = new mongoose.Types.ObjectId();
                            var s3 = new aws.S3();
                            s3.upload({
                                Bucket: process.env.AWS_BUCKET_NAME,
                                Body: file.buffer,
                                Key: path.join('imports', `${timestamp}.txt`)
                            }, function(error, data) {
                                if (!!error || !data) {
                                    res.status(400).json({ message: "Could not upload file." });
                                } else {
                                    let newImport = new require("../models/Import")({
                                        "_id": timestamp,
                                        "type": "stocks",
                                        "system": system,
                                        "currency": currency_cost_prices,
                                        "opco": capex_file_code,
                                        "status": "pending",
                                        "createdBy": user._id,
                                        "accountId": user.accountId
                                    });
    
                                    newImport
                                    .save()
                                    .then( () => res.status(200).json({message: "Import in progress." }))
                                    .catch( (err) => {
                                        res.status(400).json({message: "Import failed." })
                                    });
                                }
    
                            });
                        }
                    });
                }
            }
        });
    }
}

const uploadParam = (req, res, next) => {
    const file = req.file;
    const user = req.user;
    
    if(!user.isAdmin || !user.accountId) {
        res.status(401).send("Unauthorized");
    } else if (!file) {
        res.status(400).json({ message: "File is missing missing."});  
    } else if (path.extname(file.originalname) !== ".xlsx") {
        res.status(400).json({ message: "xlsxm format not supported: save your file as xlsx and try again." });
    } else {
        let timestamp = new mongoose.Types.ObjectId();
        var s3 = new aws.S3();
        s3.upload({
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.buffer,
            Key: path.join('imports', `${timestamp}.xlsx`)
        }, function(error, data) {
            if (!!error || !data) {
                res.status(400).json({ message: "Could not upload file." });
            } else {
                let newImport = new require("../models/Import")({
                    "_id": timestamp,
                    "type": "params",
                    "status": "pending",
                    "createdBy": user._id,
                    "accountId": user.accountId
                });

                newImport
                .save()
                .then( () => res.status(200).json({message: "Import in progress." }))
                .catch( (err) => {
                    res.status(400).json({message: "Import failed." })
                });
            }

        });
    }
}

const downloadParam = (req, res, next) => {
    const user = req.user;
    if(!user.isAdmin) {
        res.status(400).json({ message: "You do not have the permission to download params"});
    } else {
        var s3 = new aws.S3();
        s3.getObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: path.join('templates', `duf_params.xlsm`)
        }).createReadStream()
        .on('error', () => {
            res.status(400).json({message: "The file could not be located."});
        }).pipe(res);
    }
}


function matchDropdown() {
    let myArgs = arguments;
    return new Promise(function(resolve) {
        resolve(["type", "status", "user", "createdAt", "expiresAt" ].reduce(function(acc, cur, index) {
            if (!!myArgs[index]) {
                if (["createdAt", "expiresAt"].includes(cur)) {
                    acc[`${cur}X`] = myArgs[index];
                } else {
                    acc[`${cur}`] = myArgs[index];
                }
            }
            return acc;
        },{}));
    });
}

const test = (req, res, next) => {
    require("../models/Import").aggregate([
        {
            "$match": {
                "expiresAt": { "$lte": new Date }
            }
        },
        {
            "$group": {
                "_id": null,
                "_ids": { "$push": "$_id" }
            }
        }
    ]).exec(function(err, data) {
        if (!!err || data.length < 1) {
            res.status(400).json({"message": "toto"});
        } else {
            res.status(200).send(data[0].importIds);
        }
    });
}



const importController = {
    getById,
    getAll,
    getDrop,
    uploadStock,
    uploadParam,
    downloadParam,
    test
};

module.exports = importController;
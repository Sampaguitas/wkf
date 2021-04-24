const bcrypt = require("bcrypt");
const aws = require('aws-sdk');
const path = require('path');
const mongoose = require("mongoose")

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

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
                    console.log("toto")
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
        res.status(400).json({ message: "Wrong file format." }); 
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
            Key: path.join('templates', `duf_params.xls`)
        }).createReadStream()
        .on('error', () => {
            res.status(400).json({message: "The file could not be located."});
        }).pipe(res);
    }
}

const importController = {
    uploadStock,
    uploadParam,
    downloadParam
};

module.exports = importController;
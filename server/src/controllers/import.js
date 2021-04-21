const bcrypt = require("bcrypt");
var aws = require('aws-sdk');
var path = require('path');

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

const uploadStock = (req, res, next) => {
    const file = req.file;
    const { email, key, opco } = req.body;
    if (!email || !key || !opco || !file) {
        console.log("Fields are missing.");
        res.status(400).json({ message: "Fields are missing."});  
    } else {
        require("../models/User")
        .findOne({ email })
        .populate({
            path: "account",
            populate: {
                path: "opcos",
                match: {
                    "stockInfo.capex_file_code": opco 
                }
            }
        })
        .exec(function(err, user) {
            if (!!err, !user) {
                console.log(err);
                res.status(400).json({ message: "User not found." });
            } else if (!user.isAdmin || !user.account || !user.account.uploadKey || user.account.opcos.length === 0 ) { //|| !user.account.isActive 
                console.log("Unauthorized");
                res.status(401).send("Unauthorized");
            } else {
                bcrypt.compare(key, user.account.uploadKey).then(isMatch => {
                    if (!isMatch) {
                        console.log("Unauthorized");
                        res.status(401).send("Unauthorized");
                    } else {
                            console.log("file.originalname:", file.originalname);
                            console.log("capex_file_code:", user.account.opcos[0].stockInfo.capex_file_code);
                            console.log("system:", user.account.opcos[0].stockInfo.system);
                            console.log("currency_cost_prices:", user.account.opcos[0].stockInfo.currency_cost_prices);
                            console.log("userId:", user._id);
                            res.status(200).json({ message: file.originalname});
                    }
                });
            }
        })
        // .then(user => {
        //     if (!user) {
        //         res.status(400).json({ message: "Wrong email or password." });
        //     } else {
        //         bcrypt.compare(password, user.password).then(isMatch => {
        //             if (!isMatch) { 
        //                 res.status(400).json({ message: "Wrong email or password." });
        //             } else if (!user.isAdmin){
        //                 res.status(401).send("Unauthorized");
        //             } else {
        //                 console.log("file.originalname:", file.originalname);
        //                 console.log("userId:", user._id);
        //                 res.status(200).json({ message: file.originalname});
        //             }
        //         });
        //     }
        // });
    }
    // const {exportId} = req.params;
    // require("../models/Export").findById(exportId, function(err, document) {
    //     if (!!err) {
    //         res.status(400).json({ message: "An error has occured."});
    //     } else if (!document) {
    //         res.status(400).json({ message: "Could not find the document."});
    //     } else {
    //         var s3 = new aws.S3();
    //         s3.getObject({
    //             Bucket: process.env.AWS_BUCKET_NAME,
    //             Key: path.join('exports', `${document._id}.xlsx`)
    //         }).createReadStream()
    //         .on('error', () => {
    //             res.status(400).json({message: "The file could not be located."});
    //         }).pipe(res);
    //     }
    // });

    // else if (!file) {
    //     console.log("The file is missing");
    //     res.status(400).json({ message: "The file is missing"});
}

const importController = {
    uploadStock
};

module.exports = importController;
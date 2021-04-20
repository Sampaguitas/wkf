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
    const { email, password, opco } = req.body;
    if (!email || !password || !opco || !system || !file) {
        console.log("email, password or file is missing");
        res.status(400).json({ message: "email, password, opco, system or file is missing"});  
    } else {
        require("../models/User").findOne({ email }, { password:1, isAdmin: 1 })
        .then(user => {
            if (!user) {
                res.status(400).json({ message: "Wrong email or password." });
            } else {
                bcrypt.compare(password, user.password).then(isMatch => {
                    if (!isMatch) { 
                        res.status(400).json({ message: "Wrong email or password." });
                    } else if (!user.isAdmin){
                        res.status(401).send("Unauthorized");
                    } else {
                        console.log("file.originalname:", file.originalname);
                        console.log("userId:", user._id);
                        res.status(200).json({ message: file.originalname});
                    }
                });
            }
        });
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
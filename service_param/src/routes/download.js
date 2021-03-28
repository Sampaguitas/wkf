const express = require("express");
const router = express.Router();
var aws = require("aws-sdk");

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

router.get("/", (req, res) => {
    var s3 = new aws.S3();
    var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "duf_params.xlsm",
    };

    s3.getObject(params).createReadStream()
    .on('error', () => {
      res.status(400).json({message: "File could not be located - Please upload a new one"});
    }).pipe(res);
});

module.exports = router;

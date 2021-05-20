var aws = require("aws-sdk");
var path = require('path');

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

module.exports = (folder, _id, type) => {
    return new Promise(function(resolve) {
        var s3 = new aws.S3();
        s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: path.join(folder, `${_id}${type}`),
        }, () => resolve());
    });
};
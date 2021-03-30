const express = require("express");
const router = express.Router();
var aws = require("aws-sdk");

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

router.get("/", (req, res) => {
  require("../functions/processRefresh")().then( () => {
    require("../functions/processCheck")("update params").then( () => {
        require("../functions/processCreate")("update params", req.user.name).then(processId => {
          
          res.status(200).json({ "processId": processId });

          var s3_template = new aws.S3();
          var params_template = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: "duf_params.xlsm",
          };

          s3_template.getObject(params_template).createReadStream()
          .then(async function(workbook) {

              const buffer = workbook.xlsx.writeBuffer();
              var s3_export = new aws.S3();
              var params_export = {
                Bucket: awsBucketName,
                Body: buffer,
                Key: path.join('exports', processId),
              };

              s3_export.upload(params_export, function(err) {
                  if (err) {
                    require("../functions/processFinalise")(processId, "Failed", []).then( () => console.log("done"))
                  } else {
                    require("../functions/processFinalise")(processId, "Download", []).then( () => console.log("done"))
                  }
              });
          });
            
        }).catch(errCreate => res.status(400).json({ "message": errCreate.message }));
    }).catch(errCheck => res.status(400).json({"message": errCheck.message }));
  });
});

module.exports = router;

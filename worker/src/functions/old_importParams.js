var aws = require("aws-sdk");
var path = require('path');
var Excel = require('exceljs');
var Stream = require('stream');

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

module.exports = (document) => {
  return new Promise(function(resolve) {
    let myPromises = [];
    let nRejected = 0;
    let nUpserted = 0;
    let rejections = [];
    if (!document.accountId) {
        require("./importReject")(document._id).then( () => resolve())
    } else {
        var s3 = new aws.S3();
        var workbook = new Excel.Workbook();
        workbook.xlsx.read(s3.getObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: path.join("imports", `${document._id}.xlsx`),
        }).createReadStream())
        .then(function(workbook) {
            worksheet = workbook.getWorksheet('Sheet1');
                const lastRow = worksheet.rowCount;
                if (lastRow < 3) {
                    let message = `${nRejected + nUpserted} processed, ${nRejected} rejected, ${nUpserted} upserted.`;
                    require("./importFinalise")(document._id, 0, message, []).then( () => resolve()); 
                } else {
                    for (let lineIndex = 3; lineIndex < lastRow + 1; lineIndex++) {
                        let artNr = worksheet.getCell(`A${lineIndex}`).value;
                        let sizeOne = worksheet.getCell(`G${lineIndex}`).value;
                        let sizeTwo = worksheet.getCell(`H${lineIndex}`).value;
                        let sizeThree = worksheet.getCell(`I${lineIndex}`).value;
                        let wallOne = worksheet.getCell(`J${lineIndex}`).value;
                        let wallTwo = worksheet.getCell(`K${lineIndex}`).value;
                        let type = worksheet.getCell(`L${lineIndex}`).value;
                        let grade = worksheet.getCell(`M${lineIndex}`).value;
                        let length = worksheet.getCell(`N${lineIndex}`).value;
                        let end = worksheet.getCell(`O${lineIndex}`).value;
                        let surface = worksheet.getCell(`P${lineIndex}`).value;
    
                        myPromises.push(updateParam(artNr, sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface, lineIndex, accountId.accountId));
                    }
    
                    Promise.all(myPromises).then(myResults => {
                        myResults.map((result) => {
                            if (result.isRejected) {
                                nRejected++;
                                rejections.push({
                                    "row": result.row,
                                    "reason": result.reason
                                });
                            } else {
                                nUpserted++;
                            }
                        });
                        let message = `${nRejected + nUpserted} processed, ${nRejected} rejected, ${nUpserted} upserted.`;
                        require("./importFinalise")(document._id, myResults.length, message, rejections).then( () => resolve())
                    });
                }
        }).catch( () => require("./importReject")(document._id).then( () => resolve()));
    }
  });
}

function updateParam(artNr, sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface, index, accountId) {
    return new Promise(function(resolve) {
            if (!artNr || !sizeOne || !type || !grade) {
                resolve({
                    "isRejected": true,
                    "row": index,
                    "reason": "artNr, sizeOne, type or grade is missing."
                });
            } else {
                require("./getParam")(sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface)
                .then(parameters => {
                    require("../models/Stock").updateMany({
                        "artNr": artNr,
                        "accountId": accountId
                    },
                    {
                        "parameters": parameters
                    },
                    function(errUpdate, docs) {
                        if (!!errUpdate) {
                            resolve({
                                "isRejected": true,
                                "row": index,
                                "reason": "Could not update param."
                            });
                        } else {
                            resolve({
                                "isRejected": false
                            });
                        }
                    });
                });
            }
    });
}

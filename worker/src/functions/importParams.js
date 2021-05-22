var aws = require("aws-sdk");
var path = require('path');
var Excel = require('exceljs');

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

module.exports = (document) => {
  return new Promise(function(resolve) {
    let myPromises = [];
    let nRejected = 0;
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
                    let message = `${nRejected} processed, ${nRejected} rejected, 0 modified, 0 removed.`;
                    require("./importFinalise")(document._id, 0, message, []).then( () => resolve()); 
                } else {
                    for (let lineIndex = 3; lineIndex < lastRow + 1; lineIndex++) {
                        let opco = worksheet.getCell(`A${lineIndex}`).value;
                        let artNr = worksheet.getCell(`B${lineIndex}`).value;
                        let sizeOne = worksheet.getCell(`H${lineIndex}`).value;
                        let sizeTwo = worksheet.getCell(`I${lineIndex}`).value;
                        let sizeThree = worksheet.getCell(`J${lineIndex}`).value;
                        let wallOne = worksheet.getCell(`K${lineIndex}`).value;
                        let wallTwo = worksheet.getCell(`L${lineIndex}`).value;
                        let type = worksheet.getCell(`M${lineIndex}`).value;
                        let grade = worksheet.getCell(`N${lineIndex}`).value;
                        let length = worksheet.getCell(`O${lineIndex}`).value;
                        let end = worksheet.getCell(`P${lineIndex}`).value;
                        let surface = worksheet.getCell(`Q${lineIndex}`).value;
                        if (!opco || !artNr || !sizeOne || !type || !grade) {
                            nRejected++;
                            rejections.push({
                                "row": lineIndex,
                                "reason": "opco, artNr, sizeOne, type or grade is missing."
                            });
                        } else {
                            myPromises.push(updateOperation(opco, artNr, sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface, document.accountId));
                        }
                    }
    
                    Promise.all(myPromises).then(bulkOperations => {
                        require("../models/Stock").bulkWrite([
                            ...bulkOperations
                        ], {
                            // writeConcern : { w : "majority", wtimeout : 100 },
                            ordered : false
                        }).then(res => {
                            if (!!res.result) {
                                let message = `${lastRow - 2} processed, ${nRejected + res.result.writeErrors.length} rejected, ${res.result.nModified} modified, ${res.result.nRemoved} removed.`;
                                require("./importFinalise")(document._id, 0, message, rejections).then( () => resolve());
                            } else {
                                require("./importReject")(document._id).then( () => resolve());
                            }
                        });
                    });
                }
        }).catch( () => require("./importReject")(document._id).then( () => resolve()));
    }
  });
}

function updateOperation(opco, artNr, sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface, accountId) {
    return new Promise(function(resolve) {
        require("./getParam")(sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface)
        .then(parameters => {
            
            let filter = { opco, artNr, accountId };
            let update = { parameters };
            
            resolve( { "updateOne": { "filter": filter, "update": update } } );
        });
    });
}

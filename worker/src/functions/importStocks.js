var aws = require("aws-sdk");
var path = require('path');

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
    if (!document.system ||  !document.currency || !document.opco) {
        require("./importReject")(document._id).then( () => resolve());
    } else {
        require("../functions/getRate")(document.currency, "EUR").then(rate => {
            console.log("rate:", rate);
            var s3 = new aws.S3();
            s3.getObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: path.join("imports", `${document._id}.txt`),
            }, function(err, file) {
                if(!!err || !file) {
                    require("./importReject")(document._id).then( () => resolve());
                } else {
                    const rows = file.Body.toString().replace(/\r*/g,"").split("\n"); //buffer
                    let rowsLength = rows.length;
                    if (rowsLength < 3) {
                        let message = `${nRejected + nUpserted} processed, ${nRejected} rejected, ${nUpserted} upserted.`;
                        require("./importFinalise")(document._id, 0, message, []).then( () => resolve());
                    } else {
                        for (var i = 1; i < rowsLength - 1; i++) {
                            let row = rows[i].split("\t");
                            if (row.length != 21) {
                                myPromises.push({
                                    isRejected: true,
                                    isUpserted: false,
                                    row: i + 1,
                                    reason: "line does not contain 21 fields."
                                });
                            } else if (!["LB", "FT", "ST", "KG", "M"].includes(require("../functions/getString")(row[10]))) {
                                myPromises.push({
                                    isRejected: true,
                                    isUpserted: false,
                                    row: i + 1,
                                    reason: "unknown unit of mesurement."
                                });
                            } else {
                                if (!Number(row[5]) && !Number(row[6])) {
                                    myPromises.push(deleteStock(row, i, document.opco, document.accountId));
                                }  else {
                                    myPromises.push(updateStock(row, i, document.opco, document.accountId, document.system, rate));
                                }
                            }
                        }
        
                        Promise.all(myPromises).then(myResults => {
                            myResults.map(result => {
                                if (!!result.isRejected) {
                                    nRejected++;
                                    rejections.push({
                                        "row": result.row,
                                        "reason": result.reason
                                    });
                                } else if (!!result.isUpserted) {
                                    nUpserted++;
                                }
                            });
                            let message = `${nRejected + nUpserted} processed, ${nRejected} rejected, ${nUpserted} upserted.`;
                            require("../functions/importFinalise")(document._id, myResults.length, message, rejections).then( () => resolve())
                        });
        
                    }
                }
            });
        }).catch( () => require("./importReject")(document._id).then( () => resolve()));
    }
  });
}

function updateStock(row, index, opco, accountId, system, rate) {
return new Promise(function(resolve) {
        let uom = require("../functions/getString")(row[10]);
        let filter = { artNr: require("../functions/getString")(row[2]), opco, accountId }
        let options = { new: true, upsert: true }
        let update = {
            $set: {
                "description": require("./getString")(row[3]),
                "vlunar": require("./getString")(row[1]),
                "weight": require("./getWeight")(system, uom, Number(row[8])),
                "uom": require("./getUom")(uom),
                "qty": require("./getQty")(uom, Number(row[4])),
                "price": {
                    "gip": require("./getPrice")(uom, Number(row[5]), rate),
                    "rv": require("./getPrice")(uom, Number(row[6]), rate)
                },
                "purchase": {
                    "supplier": require("./getString")(row[11]),
                    "qty": require("./getQty")(uom, Number(row[7])),
                    "firstInStock": require("./getQty")(uom, Number(row[9])),
                    "deliveryDate": require("./getDate")(row[12])
                },
                "supplier": {
                    "names": [
                        require("./getString")(row[13]),
                        require("./getString")(row[14]),
                        require("./getString")(row[15]),
                        require("./getString")(row[16])
                    ],
                    "qtys": [
                        require("./getQty")(uom, Number(row[17])),
                        require("./getQty")(uom, Number(row[18])),
                        require("./getQty")(uom, Number(row[19])),
                        require("./getQty")(uom, Number(row[20]))
                    ]
                }
            }
        }
        require("../models/Stock").findOneAndUpdate(filter, update, options, function(err, res) {
            if (!!err || !res) {
                console.log("err:", err);
                resolve({
                    isRejected: true,
                    isUpserted: false,
                    row: index + 1,
                    reason: "an error has occured1."
                });
            } else {
                resolve({
                    isRejected: false,
                    isUpserted: true 
                });
            }
        });
    });
}

function deleteStock(row, index, opco, accountId) {
    return new Promise(function(resolve) {
        let filter = { artNr: require("../functions/getString")(row[2]), opco, accountId }
        require("../models/Stock").findOneAndDelete(filter, function(err, res) {
            if (!!err) {
                resolve({
                    isRejected: true,
                    isUpserted: false,
                    row: index + 1,
                    reason: "an error has occured2."
                });
            } else {
                resolve({
                    isRejected: false,
                    isUpserted: true 
                });
            }
        });
    });
}

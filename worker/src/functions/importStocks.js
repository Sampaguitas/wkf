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
    let myBulks = [];
    let nRejected = 0;
    let nModified = 0;
    let nRemoved = 0;
    let rejections = [];
    if (!document.system ||  !document.currency || !document.opco) {
        require("./importReject")(document._id).then( () => resolve());
    } else {
        require("../functions/getRate")(document.currency, "EUR").then(rate => {
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
                        let message = `${nRejected} processed, ${nRejected} rejected, 0 modified, 0 removed.`;
                        require("./importFinalise")(document._id, 0, message, []).then( () => resolve());
                    } else {
                        for (var i = 1; i < rowsLength - 1; i++) {
                            let row = rows[i].split("\t");
                            if (row.length != 21) {
                                nRejected++;
                                // rejections.push({
                                //     "row": i + 1,
                                //     "reason": "line does not contain 21 fields."
                                // });
                            } else if (!["LB", "FT", "ST", "KG", "M"].includes(require("../functions/getString")(row[10]))) {
                                nRejected++;
                                // rejections.push({
                                //     "row": i + 1,
                                //     "reason": "unknown unit of mesurement."
                                // });
                            } else {
                                if (!Number(row[5]) && !Number(row[6])) {
                                    // myPromises.push(deleteOperation(row, document.opco, document.accountId));
                                }  else {
                                    myPromises.push(updateOperation(row, document.opco, document.accountId, document.system, rate));
                                }
                            }
                        }

                        Promise.all(myPromises).then(bulkOperations => {
                            let chunks = require("./chunk")(bulkOperations, 10000);
                            chunks.map(chunk => {
                                myBulks.push(bulkWritePromise(chunk));
                            });
                            
                            Promise.all(myBulks).then(results => {
                                results.map(result => {
                                    nRejected += result.nRejected;
                                    nModified += result.nModified;
                                    nRemoved += result.nRemoved;
                                });
                                let message = `${rowsLength - 1} processed, ${nRejected} rejected, ${nModified} modified, ${nRemoved} removed.`;
                                require("./importFinalise")(document._id, 0, message, rejections).then( () => resolve());
                            });


                            // require("../models/Stock").bulkWrite([
                            //     ...bulkOperations
                            // ], {
                            //     writeConcern : { w : "majority", wtimeout : 100 },
                            //     ordered : false
                            // }).then(res => {
                            //     if (!!res.result) {
                            //         let message = `${rowsLength - 1} processed, ${nRejected + res.result.writeErrors.length} rejected, ${res.result.nModified} modified, ${res.result.nRemoved} removed.`;
                            //         require("./importFinalise")(document._id, 0, message, rejections).then( () => resolve());
                            //     } else {
                            //         require("./importReject")(document._id).then( () => resolve());
                            //     }
                            // });
                        });
                    }
                }
            });
        }).catch( () => {
            require("./importReject")(document._id).then( () => resolve())
        });
    }
  });
}

function bulkWritePromise(bulkOperations) {
    return new Promise(function(resolve) {
        require("../models/Stock").bulkWrite([
            ...bulkOperations
        ], {
            ordered : false
        }).then(res => {
            if (!!res.result) {
                resolve({
                    nRejected: res.result.writeErrors.length || 0,
                    nModified: res.result.nModified || 0,
                    nRemoved: res.result.nRemoved || 0
                });
            } else {
                resolve({
                    nRejected: 0,
                    nModified: 0,
                    nRemoved: 0
                });
            }
        });
    });
}

function updateOperation(row, opco, accountId, system, rate) {
    return new Promise(function(resolve) {
        let uom = require("../functions/getString")(row[10]);
        let filter = { artNr: require("../functions/getString")(row[2]), opco, accountId }
        // let options = { new: true, upsert: true }
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
                    "supplier": require("./getSupplier")(row[11]),
                    "qty": require("./getQty")(uom, Number(row[7])),
                    "firstInStock": require("./getQty")(uom, Number(row[9])),
                    "deliveryDate": require("./getDate")(row[12])
                },
                "supplier": {
                    "names": [
                        require("./getSupplier")(row[13]),
                        require("./getSupplier")(row[14]),
                        require("./getSupplier")(row[15]),
                        require("./getSupplier")(row[16])
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

        resolve( { "updateOne": { "filter": filter, "update": update, "upsert": true } } );

    });
}

function deleteOperation(row, opco, accountId) {
    return new Promise(function(resolve) {
        let filter = { artNr: require("../functions/getString")(row[2]), opco, accountId }
        resolve( { "deleteOne": { "filter": filter } } );
    });
}


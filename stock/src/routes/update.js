const express = require("express");
const router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post("/", upload.single("file"), function(req, res) {
    
    const file = req.file;
    const { pwd, loc } = req.body;
    
    let myPromises = [];
    let nRejected = 0;
    let nUpserted = 0;
    let rejections = [];
    
    if (pwd !== require("../config/keys").curlPwd) {
        res.status(401).send("Unauthorized");
    } else if (!loc || !file) {
        res.status(400).json({ message: "location not specified or file is missing." });
    } else {
        require("../functions/processRefresh")().then( () => {
            require("../functions/processCheck")("update stocks").then( () => {
                const rows = file.buffer.toString().replace("\r","").split("\n");
                let rowsLength = rows.length;
                if (rowsLength < 3) {
                    res.status(400).json({ "message": "the file seems to be empty." });
                } else {
                    require("../functions/processCreate")("update stocks", loc).then(processId => {
                        res.status(200).json({ "processId": processId });
                        for (var i = 1; i < rowsLength - 1; i++) {
                            let row = rows[i].split("\t");
                            if (row.length != 21) {
                                myPromises.push({
                                    isRejected: true,
                                    isUpserted: false,
                                    row: i + 1,
                                    reason: "line does not contain 21 fields."
                                });
                            } else if (!require("../functions/getString")(row[0])) {
                                myPromises.push({
                                    isRejected: true,
                                    isUpserted: false,
                                    row: i + 1,
                                    reason: "opco is not defined."
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
                                    myPromises.push(deleteStock(row, processId, i, rowsLength));
                                }  else {
                                    myPromises.push(updateStock(row, processId, i, rowsLength));
                                    myPromises.push(updateParam(row));
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
                            require("../functions/processFinalise")(processId, nRejected, nUpserted, rejections).then( () => console.log("done"))
                        });
                    }).catch(errCreate => res.status(400).json({ "message": errCreate.message }));
                }
            }).catch(errCheck => res.status(400).json({"message": errCheck.message }));
        });
    }
});

function updateStock(row, processId, index, length) {
    return new Promise(function(resolve) {
        require("../functions/processUpdate")(processId, index, length - 2).then( () => {
            let uom = require("../functions/getString")(row[10]);
            let filter = { artNr: require("../functions/getString")(row[2]), opco: require("../functions/getString")(row[0]) }
            let options = { new: true, upsert: true }
            let update = {
                $set: {
                    "qty": require("../functions/getQty")(uom, Number(row[4])),
                    "price": {
                        "gip": require("../functions/getPrice")(uom, Number(row[5]), 1),
                        "rv": require("../functions/getPrice")(uom, Number(row[6]), 1)
                    },
                    "purchase": {
                        "supplier": require("../functions/getString")(row[11]),
                        "qty": require("../functions/getQty")(uom, Number(row[7])),
                        "firstInStock": require("../functions/getQty")(uom, Number(row[9])),
                        "deliveryDate": require("../functions/getDate")(row[12])
                    },
                    "supplier": {
                        "names": [require("../functions/getString")(row[13]), require("../functions/getString")(row[14]), require("../functions/getString")(row[15]), require("../functions/getString")(row[16])],
                        "qtys": [Number(row[17]), Number(row[18]), Number(row[19]), Number(row[20])]
                    }
                }
            }
            require("../models/Stock").findOneAndUpdate(filter, update, options, function(err, res) {
                if (!!err || !res) {
                    resolve({
                        isRejected: true,
                        isUpserted: false,
                        row: index + 1,
                        reason: "an error has occured."
                    });
                } else {
                    resolve({
                        isRejected: false,
                        isUpserted: true 
                    });
                }
            });
        });
    });
}

function deleteStock(row, processId, index, length) {
    return new Promise(function(resolve) {
        require("../functions/processUpdate")(processId, index, length - 2).then( () => {
            let filter = { artNr: require("../functions/getString")(row[2]), opco: require("../functions/getString")(row[0]) }
            require("../models/Stock").findOneAndDelete(filter, function(err, res) {
                if (!!err) {
                    resolve({
                        isRejected: true,
                        isUpserted: false,
                        row: index + 1,
                        reason: "an error has occured."
                    });
                } else {
                    resolve({
                        isRejected: false,
                        isUpserted: true 
                    });
                }
            });
        });
    });
}

function updateParam(row) {
    return new Promise(function(resolve) {
        let uom = require("../functions/getString")(row[10]);
        let filter = { artNr: require("../functions/getString")(row[2]) }
        let options = { new: true, upsert: true }
        let update = {
            $set: {
                "description": require("../functions/getString")(row[3]),
                "weight": require("../functions/getWeight")(uom, Number(row[8])),
                "uom": require("../functions/getUom")(uom),
            }
        }
        require("../models/Param").findOneAndUpdate(filter, update, options, () => {
            resolve({
                isRejected: false,
                isUpserted: false
            });
        });
    });
}

module.exports = router;
var aws = require("aws-sdk");
var path = require('path');
var Excel = require('exceljs');
const Stock = require("../models/Stock");

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

module.exports = (document) => {
  return new Promise(function(resolve) {
    const { filter, sort, dropdown } = document.stockFilters;
    matchDropdown(dropdown.opco, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
        Stock.aggregate([
            { "$match": myMatch },
            { "$project": project(document.system) },
            {
                "$addFields": {
                    "qtyX": { "$toString": "$qty" },
                    "firstInStockX": { "$toString": "$firstInStock" },
                    "weightX": { "$toString": "$weight" },
                    "gipX": { "$toString": "$gip" },
                    "rvX": { "$toString": "$rv" },
                }
            },
            { "$match": matchFilter(filter.opco, filter.artNr, filter.description, filter.qty, filter.uom, filter.firstInStock, filter.weight, filter.gip, filter.currency, filter.rv) },
            { "$sort": { [!!sort.name ? sort.name : "gip"]: sort.isAscending === false ? -1 : 1 } },
            {
                "$project": {
                    "_id": 0,
                    "qtyX": 0,
                    "firstInStockX": 0,
                    "weightX": 0,
                    "gipX": 0,
                    "rvX": 0,
                    "currency": 0,
                }
            }
        ]).exec(function(error, result) {
            if (!!error || !result) {
                require("./processReject")(document._id).then( () => resolve());
            } else {
                var workbook = new Excel.Workbook();
                var worksheet = workbook.addWorksheet('My Sheet');
                worksheet.getCell("A1").value = "Company";
                worksheet.getCell("B1").value = "VLUNAR";
                worksheet.getCell("C1").value = "ItemCode";
                worksheet.getCell("D1").value = "Description";
                worksheet.getCell("E1").value = "Stock";
                worksheet.getCell("F1").value = "GIP";
                worksheet.getCell("G1").value = "RV";
                worksheet.getCell("H1").value = "PurchaseQty";
                worksheet.getCell("I1").value = "Weight";
                worksheet.getCell("J1").value = "FirstIncStock";
                worksheet.getCell("K1").value = "QuantityUnit";
                worksheet.getCell("L1").value = "Supplier";
                worksheet.getCell("M1").value = "PurchaseDeliveryDate";
                worksheet.getCell("N1").value = "Name of supplier 1";
                worksheet.getCell("O1").value = "Name of supplier 2";
                worksheet.getCell("P1").value = "Name of supplier 3";
                worksheet.getCell("Q1").value = "Name of supplier 4";
                worksheet.getCell("R1").value = "Qty in stock supplier 1";
                worksheet.getCell("S1").value = "Qty in stock supplier 2";
                worksheet.getCell("T1").value = "Qty in stock supplier 3";
                worksheet.getCell("U1").value = "Qty in stock supplier 4";
                //fill all lines
                result.map(function (line, lineIndex) {
                    worksheet.getCell(`A${lineIndex + 2}`).value = line.opco;
                    worksheet.getCell(`B${lineIndex + 2}`).value = line.vlunar;
                    worksheet.getCell(`C${lineIndex + 2}`).value = line.artNr;
                    worksheet.getCell(`D${lineIndex + 2}`).value = line.description;
                    worksheet.getCell(`E${lineIndex + 2}`).value = line.qty;
                    worksheet.getCell(`F${lineIndex + 2}`).value = line.gip;
                    worksheet.getCell(`G${lineIndex + 2}`).value = line.rv;
                    worksheet.getCell(`H${lineIndex + 2}`).value = line.purchaseQty;
                    worksheet.getCell(`I${lineIndex + 2}`).value = line.weight;
                    worksheet.getCell(`J${lineIndex + 2}`).value = line.firstInStock;
                    worksheet.getCell(`K${lineIndex + 2}`).value = line.uom;
                    worksheet.getCell(`L${lineIndex + 2}`).value = line.supplier;
                    worksheet.getCell(`M${lineIndex + 2}`).value = line.purchaseDeliveryDate;
                    worksheet.getCell(`N${lineIndex + 2}`).value = line.nameSupplierOne;
                    worksheet.getCell(`O${lineIndex + 2}`).value = line.nameSupplierTwo;
                    worksheet.getCell(`P${lineIndex + 2}`).value = line.nameSupplierThree;
                    worksheet.getCell(`Q${lineIndex + 2}`).value = line.nameSupplierFour;
                    worksheet.getCell(`R${lineIndex + 2}`).value = line.qtySupplierOne;
                    worksheet.getCell(`S${lineIndex + 2}`).value = line.qtySupplierTwo;
                    worksheet.getCell(`T${lineIndex + 2}`).value = line.qtySupplierThree;
                    worksheet.getCell(`U${lineIndex + 2}`).value = line.qtySupplierFour;
                });

                const buffer = workbook.xlsx.writeBuffer();
                var s3_export = new aws.S3();
                var params_export = {
                    Bucket: awsBucketName,
                    Body: buffer,
                    Key: path.join('exports', `${document._id}.xls`),
                };

                s3_export.upload(params_export, function(err) {
                    if (err) {
                    require("./processFinalise")(document._id, result.length).then( () => resolve());
                    } else {
                    require("./processReject")(document._id).then( () => resolve());
                    }
                });
            }
        });
    })
  });
}

function matchFilter() {
    let myArgs = arguments;
    return(["opco", "artNr", "description", "qty", "uom", "firstInStock", "weight", "gip", "currency", "rv"].reduce(function(acc, cur, index) {
        if (!!myArgs[index]) {
            if(["qty", "firstInStock", "weight", "gip", "rv"].includes(cur)) {
                acc[`${cur}X`] = { "$regex": new RegExp(require("../functions/escape")(myArgs[index]),"i") };
            } else {
                acc[`${cur}`] = { "$regex": new RegExp(require("../functions/escape")(myArgs[index]),"i") };
            }
        }
        return acc;
    }, {}));
}

function matchDropdown() {
    let myArgs = arguments;
    return new Promise(function(resolve) {
        let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/
        if (regexOutlet.test(myArgs[7])) {
            require("../functions/getSizeMm")(myArgs[4]).then(mm => {
                resolve(["opco", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                    if (!!myArgs[index]) {
                        if (cur === "opco") {
                            acc[`${cur}`] = myArgs[index];
                        } else if (cur === "pffType") {
                            acc[`parameters.type.pffType`] = myArgs[index];
                        } else if (cur === "steelType") {
                            acc[`parameters.grade.steelType`] = myArgs[index];
                        } else if (cur === "sizeTwo" && mm !== null) {
                            acc[`parameters.sizeTwo.mm`] = { $lte: mm };
                            acc[`parameters.sizeThree.mm`] = { $gte: mm };
                        } else {
                            acc[`parameters.${cur}.tags`] = myArgs[index];
                        }
                    }
                    return acc;
                },{}));
            });
        } else {
            resolve(["opco", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface"].reduce(function(acc, cur, index) {
                if (!!myArgs[index]) {
                    if (cur === "opco") {
                        acc[`${cur}`] = myArgs[index];
                    } else if (cur === "pffType") {
                        acc[`parameters.type.pffType`] = myArgs[index];
                    } else if (cur === "steelType") {
                        acc[`parameters.grade.steelType`] = myArgs[index];
                    } else {
                        acc[`parameters.${cur}.tags`] = myArgs[index];
                    }
                }
                return acc;
            },{}));
        }
    });
}


function project(system) {
    return {
        "_id": "$_id",
        "opco": "$opco",
        "vlunar": "$vlunar",
        "artNr": "$artNr",
        "description": "$description",
        "qty": {
            "$cond": [ 
                { "$eq": [system, "IMPERIAL"] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$qty", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$qty", 3.28084 ] } }
                        ],
                        default: "$qty"
                    }
                },
                "$qty"
            ]
        },
        "gip": {
            "$cond": [
                { "$eq": [ system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.gip", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.gip", 3.28084 ] } }
                        ],
                        default: "$price.gip"
                    }
                },
                "$price.gip"
            ],
        },
        "currency": "EUR",
        "rv": {
            "$cond": [
                { "$eq": [ system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$price.rv", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$price.rv", 3.28084 ] } }
                        ],
                        default: "$price.rv"
                    }
                },
                "$price.rv"
            ],
        },
        "purchaseQty": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.qty", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.qty", 3.28084 ] } }
                        ],
                        "default": "$purchase.qty"
                    }
                },
                "$purchase.qty"
            ],
        },
        "weight": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$weight", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$weight", 0.671969 ] } }
                        ],
                        "default": "$weight"
                    }
                },
                "$weight"
            ],
        },
        "firstInStock": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ "$purchase.firstInStock", 3.28084 ] } }
                        ],
                        "default": "$purchase.firstInStock"
                    }
                },
                "$purchase.firstInStock"
            ],
        },
        "uom": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": "LB" },
                            { "case": { "$eq": [ "$uom", "LB" ] }, "then": "LB" },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": "FT" },
                            { "case": { "$eq": [ "$uom", "FT" ] }, "then": "FT" },
                        ],
                        default: "ST"
                    }
                },
                "$uom"
            ],
        },
        "supplier": "$purchase.supplier",
        "purchaseDeliveryDate": "$purchase.deliveryDate",
        "nameSupplierOne": { "$arrayElemAt": ["$supplier.names", 0]},
        "nameSupplierTwo": { "$arrayElemAt": ["$supplier.names", 1]},
        "nameSupplierThree": { "$arrayElemAt": ["$supplier.names", 2]},
        "nameSupplierFour": { "$arrayElemAt": ["$supplier.names", 3]},
        "qtySupplierOne": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 0]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 0]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 0]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 0]}
            ],
        },
        "qtySupplierTwo": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 1]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 1]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 1]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 1]}
            ],
        },
        "qtySupplierThree": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 2]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 2]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 2]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 2]}
            ],
        },
        "qtySupplierFour": {
            "$cond": [
                { "$eq": [system, "IMPERIAL" ] },
                {
                    "$switch": {
                        "branches": [
                            { "case": { "$eq": [ "$uom", "KG" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 3]}, 2.204623 ] } },
                            { "case": { "$eq": [ "$uom", "M" ] }, "then": { "$multiply": [ { "$arrayElemAt": ["$supplier.qtys", 3]}, 3.28084 ] } }
                        ],
                        "default": { "$arrayElemAt": ["$supplier.qtys", 3]}
                    }
                },
                { "$arrayElemAt": ["$supplier.qtys", 3]}
            ],
        }
    }
}
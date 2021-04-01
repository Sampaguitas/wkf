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
            { "$sort": { "artNr": 1, "qty": -1 } },
            {
                "$group": {
                  "_id": "$artNr",
                  "description": { "$first": "$description" },
                  "steelType": { "$first": "$parameters.steelType" },
                  "pffType": { "$first": "$parameters.pffType" },
                  "sizeOne": { "$first": "$parameters.sizeOne" },
                  "sizeTwo": { "$first": "$parameters.sizeTwo" },
                  "sizeThree": { "$first": "$parameters.sizeThree" },
                  "wallOne": { "$first": "$parameters.wallOne" },
                  "wallTwo": { "$first": "$parameters.wallTwo" },
                  "type": { "$first": "$parameters.type" },
                  "grade": { "$first": "$parameters.grade" },
                  "length": { "$first": "$parameters.length" },
                  "end": { "$first": "$parameters.end" },
                  "surface": { "$first": "$parameters.surface" },
                }
            },
        ]).exec(function(error, result) {
            if (!!error || !result) {
                require("./processReject")(document._id).then( () => resolve());
            } else {
                // res.status(200).json(result);
                var s3_template = new aws.S3();
                
                var params_template = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: path.join("templates", "duf_params.xls"),
                };

                var workbook = new Excel.Workbook();
                workbook.xlsx.read(s3_template.getObject(params_template).createReadStream()
                .then(async function(workbook) {
                    workbook.eachSheet(function(worksheet, sheetId) {
                        if(sheetId === 1) {
                            //insert empty rows
                            if (result.length > 1) {
                                worksheet.duplicateRow(3, result.length -1, true);
                            }
                            //fill all lines
                            result.map(function (line, lineIndex) {
                                worksheet.getCell(`A${lineIndex + 3}`).value = line._id;
                                worksheet.getCell(`B${lineIndex + 3}`).value = line.description;
                                //blank col on C
                                worksheet.getCell(`D${lineIndex + 3}`).value = line.steelType;
                                worksheet.getCell(`E${lineIndex + 3}`).value = line.pffType;
                                //blank col on D
                                worksheet.getCell(`G${lineIndex + 3}`).value = line.sizeOne;
                                worksheet.getCell(`H${lineIndex + 3}`).value = line.sizeTwo;
                                worksheet.getCell(`I${lineIndex + 3}`).value = line.sizeThree;
                                worksheet.getCell(`J${lineIndex + 3}`).value = line.wallOne;
                                worksheet.getCell(`K${lineIndex + 3}`).value = line.wallTwo;
                                worksheet.getCell(`L${lineIndex + 3}`).value = line.type;
                                worksheet.getCell(`M${lineIndex + 3}`).value = line.grade;
                                worksheet.getCell(`N${lineIndex + 3}`).value = line.length;
                                worksheet.getCell(`O${lineIndex + 3}`).value = line.end;
                                worksheet.getCell(`P${lineIndex + 3}`).value = line.surface;
                            });
                        }
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
                }));
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
        "parameters": {
            "steelType": { "$ifNull": [ "$parameters.grade.steelType", "" ] },
            "pffType": { "$ifNull": [ "$parameters.type.pffType", "" ] },
            "sizeOne": { "$ifNull": [ "$parameters.sizeOne.name", "" ] },
            "sizeTwo": { "$ifNull": [ "$parameters.sizeTwo.name", "" ] },
            "sizeThree": { "$ifNull": [ "$parameters.sizeThree.name", "" ] },
            "wallOne": { "$ifNull": [ "$parameters.wallOne.name", "" ] },
            "wallTwo": { "$ifNull": [ "$parameters.wallTwo.name", "" ] },
            "type": { "$ifNull": [ "$parameters.type.name", "" ] },
            "grade": { "$ifNull": [ "$parameters.grade.name", "" ] },
            "length": { "$ifNull": [ "$parameters.length.name", "" ] },
            "end": { "$ifNull": [ "$parameters.end.name", "" ] },
            "surface": { "$ifNull": [ "$parameters.surface.name", "" ] },
        }
    }
}
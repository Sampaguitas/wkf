const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
    const { dropdown, selectedIds } = document.stockFilters;
    matchDropdown(selectedIds, dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface, dropdown.stock, dropdown.region, dropdown.country).then(myMatch => {
        require("../models/Stock").aggregate([
            ...require("../pipelines/param_pipelines/first_stage")(myMatch)
        ]).exec(function(error, result) {
            if (!!error || !result) {
                require("./exportReject")(document._id).then( () => resolve());
            } else {
                var s3_template = new aws.S3();
                var workbook = new Excel.Workbook();
                workbook.xlsx.read(s3_template.getObject({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: path.join("templates", "duf_params.xlsx"),
                }).createReadStream())
                .then(function(workbook) {
                    // workbook.eachSheet(function(worksheet, sheetId) {
                        worksheet = workbook.getWorksheet('Sheet1');
                        // if(sheetId === 1) {
                            //insert empty rows
                            if (result.length > 1) {
                                worksheet.duplicateRow(3, result.length -1, true);
                            }
                            //fill all lines
                            result.map(function (line, lineIndex) {
                                worksheet.getCell(`A${lineIndex + 3}`).value = line.opco;
                                worksheet.getCell(`B${lineIndex + 3}`).value = line.artNr;
                                worksheet.getCell(`C${lineIndex + 3}`).value = line.description;
                                //blank col on C
                                worksheet.getCell(`E${lineIndex + 3}`).value = line.steelType;
                                worksheet.getCell(`F${lineIndex + 3}`).value = line.pffType;
                                //blank col on D
                                worksheet.getCell(`H${lineIndex + 3}`).value = line.sizeOne;
                                worksheet.getCell(`I${lineIndex + 3}`).value = line.sizeTwo;
                                worksheet.getCell(`J${lineIndex + 3}`).value = line.sizeThree;
                                worksheet.getCell(`K${lineIndex + 3}`).value = line.wallOne;
                                worksheet.getCell(`L${lineIndex + 3}`).value = line.wallTwo;
                                worksheet.getCell(`M${lineIndex + 3}`).value = line.type;
                                worksheet.getCell(`N${lineIndex + 3}`).value = line.grade;
                                worksheet.getCell(`O${lineIndex + 3}`).value = line.length;
                                worksheet.getCell(`P${lineIndex + 3}`).value = line.end;
                                worksheet.getCell(`Q${lineIndex + 3}`).value = line.surface;
                            });
                        // }
                    // });

                    const s3_export = new aws.S3();
                    const stream = new Stream.PassThrough();

                    workbook.xlsx.write(stream)
                    .then(() => s3_export.upload({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Body: stream,
                        Key: path.join('exports', `${document._id}.xlsx`)
                    }).promise())
                    .then(() => require("./exportFinalise")(document._id, result.length).then( () => resolve()))
                    .catch(() => require("./exportReject")(document._id).then( () => resolve()));
                });
            }
        });
    })
  });
}

function matchDropdown() {
    let myArgs = arguments;
    return new Promise(function(resolve) {
        let regexOutlet = /^(ELBOL|ELBOWFL|LATROFL|LATROL|NIPOFL|NIPOL|SOCKOL|SWEEPOL|THREADOL|WELDOL)( \d*)?$/
        if (regexOutlet.test(myArgs[9])  || myArgs[3] === "FORGED_OLETS") {
            require("../functions/getSizeMm")(myArgs[6]).then(mm => {
                resolve(["selectedIds", "opco", "artNr", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface", "stock", "region", "country"].reduce(function(acc, cur, index) {
                    if (cur === "selectedIds" && myArgs[index].length > 0) {
                        acc[`_id`] = { "$in": myArgs[index] };
                    } else if (cur !== "selectedIds" && !!myArgs[index]) {
                        if (["opco", "artNr"].includes(cur)) {
                            acc[`${cur}`] = myArgs[index];
                        } else if (cur === "pffType") {
                            acc[`parameters.type.pffType`] = myArgs[index];
                        } else if (cur === "steelType") {
                            acc[`parameters.grade.steelType`] = myArgs[index];
                        } else if (cur === "sizeTwo" && mm !== null) {
                            acc[`parameters.sizeTwo.mm`] = { $lte: mm };
                            acc[`parameters.sizeThree.mm`] = { $gte: mm };
                        } else if (cur === "stock") {
                            acc["qty"] = { "$gt": 0 };
                        } else if (["region", "country"].includes(cur)) {
                            acc[`${cur}Id`] = ObjectId(myArgs[index]);
                        } else {
                            acc[`parameters.${cur}.tags`] = myArgs[index];
                        }
                    }
                    return acc;
                },{}));
            });
        } else {
            resolve(["selectedIds", "opco", "artNr", "pffType", "steelType", "sizeOne", "sizeTwo", "wallOne", "wallTwo", "type", "grade", "length", "end", "surface", "stock", "region", "country"].reduce(function(acc, cur, index) {
                if (cur === "selectedIds" && myArgs[index].length > 0) {
                    acc[`_id`] = { "$in": myArgs[index] };
                } else if (cur !== "selectedIds" && !!myArgs[index]) {
                    if (["opco", "artNr"].includes(cur)) {
                        acc[`${cur}`] = myArgs[index];
                    } else if (cur === "pffType") {
                        acc[`parameters.type.pffType`] = myArgs[index];
                    } else if (cur === "steelType") {
                        acc[`parameters.grade.steelType`] = myArgs[index];
                    } else if (cur === "stock") {
                        acc["qty"] = { "$gt": 0 };
                    } else if (["region", "country"].includes(cur)) {
                        acc[`${cur}Id`] = ObjectId(myArgs[index]);
                    } else {
                        acc[`parameters.${cur}.tags`] = myArgs[index];
                    }
                }
                return acc;
            },{}));
        }
    });
}
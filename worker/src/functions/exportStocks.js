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
      if (!document.stockFilters) {
        require("./exportReject")(document._id).then( () => resolve());
      } else {
        const { sort, dropdown, selectedIds } = document.stockFilters;
        matchDropdown(selectedIds, dropdown.opco, dropdown.artNr, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface, dropdown.stock, dropdown.region, dropdown.country).then(myMatch => {
            require("../models/Stock").aggregate([
                ...require("../pipelines/stock_pipelines/first_stage")(myMatch, sort)
            ]).exec(function(error, result) {
                if (!!error || !result) {
                    require("./exportReject")(document._id).then( () => resolve());
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
                }
            });
        });
      }
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

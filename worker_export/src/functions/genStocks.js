var aws = require("aws-sdk");
var path = require('path');
var Excel = require('exceljs');
var Stream = require('stream');
const Stock = require("../models/Stock");
const firstStage = require("../pipelines/stock_pipelines/first_stage");

aws.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

module.exports = (document) => {
  return new Promise(function(resolve) {
      if (!document.stockFilters) {
        require("./processReject")(document._id).then( () => resolve());
      } else {
        const { filter, sort, dropdown } = document.stockFilters;
        const system = document.system;
        matchDropdown(dropdown.opco, dropdown.pffType, dropdown.steelType, dropdown.sizeOne, dropdown.sizeTwo, dropdown.wallOne, dropdown.wallTwo, dropdown.type, dropdown.grade, dropdown.length, dropdown.end, dropdown.surface).then(myMatch => {
            Stock.aggregate([
                ...firstStage(myMatch, system, filter, sort)
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

                    const s3_export = new aws.S3();
                    const stream = new Stream.PassThrough();
                    // var params_export = {
                    //     Bucket: process.env.AWS_BUCKET_NAME,
                    //     Body: workbook,
                    //     Key: path.join('exports', `${document._id}.xls`),
                    // };
                    
                    workbook.xlsx.write(stream)
                    .then(() => s3_export.upload({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Body: stream,
                        Key: path.join('exports', `${document._id}.xls`)
                    }).promise())
                    .then(() => require("./processFinalise")(document._id, result.length).then( () => resolve()))
                    .catch(() => require("./processReject")(document._id).then( () => resolve()));
                    
                    // const buffer = workbook.xlsx.writeBuffer();
                    
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

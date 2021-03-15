const express = require("express");
const router = express.Router();

let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* in$/
let regIdt = /^(STD|XS|XXS)$/

router.get("/", (req, res) => {

    const steelType = decodeURI(req.query.steelType);
    const pffType = decodeURI(req.query.pffType);
    const sizeTwo = decodeURI(req.query.sizeTwo);
    const name = decodeURI(req.query.name);

    let regSch = ["CARBON_STEEL", "LOW_TEMP", "LOW_ALLOY"].includes(steelType) ? /^S\d*$/ : /^S\d*S?$/

    let noWallTwo = [
        "PIPES",
        "PIPE_NIPPLES",
        "FORGED_FITTINGS",
        "FORGED_OLETS",
        "FORGED_FLANGES",
        "EN_FLANGES",
        "LINE_BLANKS",
        "MI_FITTINGS",
        "SW_GASKETS",
        "FASTENERS",
        "RING_GASKETS"
    ];

    if (noWallTwo.includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeTwo)) {
        res.status(200).json([])
    } else {
        require("../models/Size").findOne({ tags: sizeTwo, mm: { $ne: null } }, function (errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../models/Wall").aggregate([
                    { $unwind: "$tags" },
                    {
                        $match: {
                            "sizeId": resTempOne.mm,
                            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
                            "tags": { $regex: new RegExp(`^${require("../functions/escape")(name)}`,'i') }
                        }
                    },
                    { $sort: { "_id": 1 } },
                    { $group: { "_id": "$key", "tags": { $push: "$tags" } } }
                ]).exec(function (error, result) {
                    if (!!error || result.length < 1) {
                        res.status(200).json([]);
                    } else {
                        let temp = result[0].tags.reduce(function (acc, cur) {
                            if (regMm.test(cur)) {
                                acc.mm.push(cur);
                            } else if (regIn.test(cur)) {
                                acc.in.push(cur);
                            } else if (regIdt.test(cur)) {
                                acc.idt.push(cur);
                            } else if (regSch.test(cur)) {
                                acc.sch.push(cur);
                            }
                            return acc;
                        }, {
                            "mm": [], "in": [], "idt": [], "sch": []
                        });
                        res.status(200).json(
                            [...temp.idt, ...temp.sch, ...temp.mm, ...temp.in]
                            .filter((value, index, self) => self.indexOf(value) === index)
                        );
                    }
                });
            }
        });
    }
});

module.exports = router;
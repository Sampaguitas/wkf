const express = require("express");
const router = express.Router();

let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* in$/
let regIdt = /^(STD|XS|XXS)$/

router.get("/", (req, res) => {
    
    const steelType = decodeURI(req.query.steel_type);
    const pffType = decodeURI(req.query.pff_type);
    const sizeOne = decodeURI(req.query.size_one);
    let regSch = [ "CARBON_STEEL", "LOW_TEMP", "LOW_ALLOY" ].includes(steelType) ? /^S\d*$/ : /^S\d*S?$/
    let noWallOne = [ "FORGED_FITTINGS", "MI_FITTINGS", "SW_GASKETS", "FASTENERS", "RING_GASKETS" ];

    if (noWallOne.includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeOne)) {
        res.status(200).json([])
    } else {
        require("../models/Size").findOne({ tags: sizeOne, mm: { $ne: null } }, function(errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../models/Wall").aggregate([
                    {
                        $unwind: "$tags"
                    },
                    {
                        $match: {
                            sizeId: resTempOne.mm
                        }
                    },
                    {
                        $sort: {
                            "_id" : 1
                        }
                    },
                    {
                        $group : {
                            _id : "$key", tags : { $push : "$tags" } 
                        }
                    }
                ])
                .exec(function(error, result) {
                    if(!!error || result.length < 1) {
                        res.status(200).json([]);
                    } else {
                        let temp = result[0].tags.reduce(function (acc, cur) {
                            if(regMm.test(cur)) {
                                acc.mm.push(cur);
                            } else if(regIn.test(cur)) {
                                acc.in.push(cur);
                            } else if(regIdt.test(cur)) {
                                acc.idt.push(cur);
                            } else if(regSch.test(cur)) {
                                acc.sch.push(cur);
                            }
                            return acc;
                        }, {
                            "mm": [],
                            "in": [],
                            "idt": [],
                            "sch": [],
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
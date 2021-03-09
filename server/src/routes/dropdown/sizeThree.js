const express = require("express");
const router = express.Router();

let regNps = /^(\d| |\/)*"$/
let regDn = /^DN \d*$/
let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* in$/

router.get("/", (req, res) => {

    const pffType = decodeURI(req.query.pffType);
    const sizeTwo = decodeURI(req.query.sizeTwo);
    const name = decodeURI(req.query.name);

    if (!["FORGED_OLETS", "OTHERS", "undefined", ""].includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeTwo)) {
        res.status(200).json([])
    } else {
        require("../../models/Size").findOne({ tags: sizeTwo }, function (errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../../models/Size").aggregate([
                    { $unwind: "$tags" },
                    {
                        $match: {
                            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
                            "mm": ["undefined", "OTHERS", ""].includes(pffType) ? { $ne: null } : pffType === "FORGED_OLETS" ? { $gte: resTempOne.mm } : { $lt: resTempOne.mm },
                            "tags": { $regex: new RegExp(`^${require("../../functions/escape")(name)}`,'i') }
                        }
                    },
                    { $sort: { "_id": 1 } },
                    { $group: { "_id": "$key", "tags": { $push: "$tags" } } }
                ]).exec(function (error, result) {
                        if (!!error || result.length < 1) {
                            res.status(200).json([]);
                        } else {
                            let temp = result[0].tags.reduce(function (acc, cur) {
                                if (regNps.test(cur)) {
                                    acc.nps.push(cur);
                                } else if (regDn.test(cur)) {
                                    acc.dn.push(cur);
                                } else if (regMm.test(cur)) {
                                    acc.mm.push(cur);
                                } else if (regIn.test(cur)) {
                                    acc.in.push(cur);
                                } else {
                                    acc.other.push(cur);
                                }
                                return acc;
                            }, { "nps": [], "dn": [], "mm": [], "in": [], "other": [] });
                            res.status(200).json(
                                [...temp.nps, ...temp.dn, ...temp.mm, ...temp.in, ...temp.other]
                                .filter((value, index, self) => self.indexOf(value) === index)
                            );
                        }
                    });
            }
        });
    }
});

module.exports = router;
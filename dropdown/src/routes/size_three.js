const express = require("express");
const router = express.Router();

let regNps = /^(\d| |\/)*"$/
let regDn = /^DN \d*$/
let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* in$/

router.get("/", (req, res) => {
    const pff_type = decodeURI(req.query.pff_type);
    const size_two = decodeURI(req.query.size_two);
    console.log(pff_type);
    if (!!req.query.pff_type && !["FORGED_OLETS", "OTHERS"].includes(pff_type)) {
        res.status(200).json([]);
    } else {
        let temp_two = require("../constants/sizes.json")
        .find(e => e.tags.includes(size_two) && !!e.mm);
        if (!temp_two) {
            res.status(200).json([]);
        } else {
            let temp_three = require("../constants/sizes.json")
            .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? e.pffTypes.includes(pff_type) : !!e.mm)
            .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? pff_type === "FORGED_OLETS" ? e.mm >= temp_two.mm : false : !!e.mm)
            .reduce(function (acc, cur) {
                cur.tags.map(tag => {
                    if(regNps.test(tag)) {
                        acc.nps.push(tag);
                    } else if(regDn.test(tag)) {
                        acc.dn.push(tag);
                    } else if(regMm.test(tag)) {
                        acc.mm.push(tag);
                    } else if(regIn.test(tag)) {
                        acc.in.push(tag);
                    } else {
                        acc.other.push(tag);
                    }
                });
                return acc;
            }, {
                "nps": [],
                "dn": [],
                "mm": [],
                "in": [],
                "other": []
            });
            res.status(200).json(
            [...temp_three.nps, ...temp_three.dn, ...temp_three.mm, ...temp_three.in, ...temp_three.other]
            .filter((value, index, self) => self.indexOf(value) === index)
            );
        }
    }
});

module.exports = router;
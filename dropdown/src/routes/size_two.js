const express = require("express");
const router = express.Router();

let regNps = /^(\d| |\/)*"$/
let regDn = /^DN \d*$/
let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* mm$/

router.get("/", (req, res) => {
    const pff_type = decodeURI(req.query.pff_type);
    const size_one = decodeURI(req.query.size_one);
    let noPffTwo = [
        "PIPES",
        "PIPE_NIPPLES", 
        "LINE_BLANKS",
        "FASTENERS",
        "RING_GASKETS",
        "SW_GASKETS",
    ]
    
    if (noPffTwo.includes(pff_type)) {
        res.status(200).json([]);
    } else {
        let temp_one = require("../constants/sizes.json")
        .find(e => e.tags.includes(size_one) && !!e.mm);
        if (!temp_one) {
            res.status(200).json([]);
        } else {
            let temp_two = require("../constants/sizes.json")
            .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? e.pffTypes.includes(pff_type) : !!e.mm)
            .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? pff_type === "FORGED_OLETS" ? e.mm >= temp_one.mm : e.mm < temp_one.mm : !!e.mm)
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
                [...temp_two.nps, ...temp_two.dn, ...temp_two.mm, ...temp_two.in, ...temp_two.other]
                .filter((value, index, self) => self.indexOf(value) === index)
            );
        }
    }
});

module.exports = router;
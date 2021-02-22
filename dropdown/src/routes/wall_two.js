const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    
    const steel_type = decodeURI(req.query.steel_type);
    const pff_type = decodeURI(req.query.pff_type);
    const size_two = decodeURI(req.query.size_two);

    let regMm = /^(\d|\.)* mm$/
    let regIn = /^(\d|\.)* in$/
    let regIdt = /^(STD|XS|XXS)$/
    let regSch = [
        "CARBON_STEEL",
        "LOW_TEMP",
        "LOW_ALLOY",
    ].includes(steel_type) ? /^S\d*$/ : /^S\d*S?$/

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
    ]

    let sizeObject = require("../constants/sizes.json").find(e => e.tags.includes(size_two) && !!e.mm)
    if (noWallTwo.includes(pff_type) || !sizeObject) {
        res.status(200).json([])
    } else {
        let temp = require("../constants/walls.json")
        .filter(e => e.sizeId === sizeObject.mm)
        .reduce(function (acc, cur) {
            cur.tags.map(tag => {
                if(regMm.test(tag)) {
                    acc.mm.push(tag);
                } else if(regIn.test(tag)) {
                    acc.in.push(tag);
                } else if(regIdt.test(tag)) {
                    acc.idt.push(tag);
                } else if(regSch.test(tag)) {
                    acc.sch.push(tag);
                }
            });
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

module.exports = router;
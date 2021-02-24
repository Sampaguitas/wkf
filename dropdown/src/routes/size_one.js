const express = require("express");
const router = express.Router();

let regNps = /^(\d| |\/)*"$/
let regDn = /^DN \d*$/
let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* in$/

router.get("/", (req, res) => {
    
    const pffType = decodeURI(req.query.pff_type);

    require("../models/Size").aggregate([
        { $unwind: "$tags" },
        { $match: { "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType } },
        { $sort: { "_id" : 1 } },
        { $group : { "_id" : "$key", "tags" : { $push : "$tags" } } }
    ])
    .exec(function(error, result) {
        if(!!error || result.length < 1) {
            res.status(200).json([]);
        } else {
            let temp = result[0].tags.reduce(function(acc, cur) {
                if(regNps.test(cur)) {
                    acc.nps.push(cur);
                } else if(regDn.test(cur)) {
                    acc.dn.push(cur);
                } else if(regMm.test(cur)) {
                    acc.mm.push(cur);
                } else if(regIn.test(cur)) {
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
});


module.exports = router;
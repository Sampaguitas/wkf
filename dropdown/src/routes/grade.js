const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const steel_type = decodeURI(req.query.steel_type);
    const pff_type = decodeURI(req.query.pff_type);
    res.status(200).json(require("../constants/grades.json")
    .filter(e => !!req.query.steel_type && steel_type !== "OTHERS" ? e.steelType === steel_type : true)
    .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? e.pffTypes.includes(pff_type) : true)
    .reduce(function (acc, cur) {
        acc.push(cur.name);
        return acc;
    }, [])
    .sort((a, b) => a.localeCompare(b)));
});

module.exports = router;
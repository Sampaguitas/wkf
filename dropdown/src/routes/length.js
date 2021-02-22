const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const pff_type = decodeURI(req.query.pff_type);
    res.status(200).json(require("../constants/lengths.json")
    .filter(e => !!req.query.pff_type && pff_type !== "OTHERS" ? e.pffTypes.includes(pff_type) : true)
    .reduce(function (acc, cur) {
        acc.push(cur.name);
        return acc;
    }, []));
});

module.exports = router;
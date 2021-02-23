const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    
    const steelType = decodeURI(req.query.steel_type);
    const pffType = decodeURI(req.query.pff_type);
    const isMultiple = decodeURI(req.query.is_multiple);
    const isComplete = decodeURI(req.query.is_complete);

    let query = {
        steelType: ["undefined", "OTHERS", ""].includes(steelType) ? { $exists: true } : steelType,
        pffTypes: ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
        isComplete: isComplete === "true" ?  true : { $exists: true },
        isMultiple: isMultiple === "false" ?  false : { $exists: true }
    };

    require("../models/Grade").distinct("name", query).exec(function(error, result) {
        if(!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a,b) => a.localeCompare(b)));
        }
    });
});

module.exports = router;
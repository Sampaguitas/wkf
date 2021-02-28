const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const { artNr } = req.body;
    const { sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface } = req.body;
    require("../functions/getParam")(sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface)
    .then(parameters => {
        require("../models/Param").findOneAndUpdate({ "artNr": artNr }, {
            "description": require("../functions/getDesc")(parameters),
            "vlunar": require("../functions/getVlunar")(parameters),
            "parameters": parameters
        }, {new: true, upsert: true }, function(errUpdate, resUpdate) {
            if (!!errUpdate || !resUpdate) {
                res.status(400).json({message: "Could not update param."});
            } else {
                res.status(200).json({message: resUpdate });
            }
        });
    });
});

module.exports = router;
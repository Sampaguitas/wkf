const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const { artNr } = req.body;
    const { sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface } = req.body;
    require("../functions/getParam")(sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface)
    .then(parameters => {
        res.status(200).json({
            "artNr": artNr,
            "description": require("../functions/getDesc")(parameters),
            "vlunar": require("../functions/getVlunar")(parameters),
            "parameters": parameters
        });
    });
});

module.exports = router;
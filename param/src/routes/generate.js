const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    const { sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface } = req.body;
    let tempObject = {}
    let pffType = await require("../functions/getPff")(type);
    tempObject.pffType = await require("../functions/getPff")(type);
    tempObject.sizeOne = await require("../functions/getSize")(sizeOne, pffType);
    tempObject.sizeTwo = await require("../functions/getSize")(sizeTwo, pffType);
    tempObject.sizeThree = await require("../functions/getSize")(sizeThree, pffType);
    tempObject.wallOne = await require("../functions/getWall")(tempObject.sizeOne.mm, wallOne);
    tempObject.wallTwo = await require("../functions/getWall")(tempObject.sizeTwo.mm, !!wallTwo ? wallTwo : !!sizeTwo ? wallOne : "");
    tempObject.wallThree = await require("../functions/getWall")(tempObject.sizeThree.mm, wallOne);
    tempObject.type = await require("../functions/getType")(tempObject.sizeOne.mm, type);
    tempObject.grade = await require("../functions/getGrade")(grade);
    tempObject.length = await require("../functions/getLength")(length);
    tempObject.end = await require("../functions/getEnd")(tempObject.type, end);
    res.status(200).json({ "tempObject": tempObject});
});

module.exports = router;
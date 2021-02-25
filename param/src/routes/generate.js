const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    const { sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface } = req.body;
    
    let PromisesOne = [];
    let PromisesTwo = [];
    let PromisesThree = [];
    
    let tempObject = {}

    PromisesOne
    .push(require("../functions/getPff")(type))
    .push(require("../functions/getGrade")(grade))
    .push(require("../functions/getLength")(length));
    await Promise.all(PromisesOne).then(results => results.map(r => tempObject[r.key] = r.value));

    // tempObject.pffType = await require("../functions/getPff")(type);
    // tempObject.grade = await require("../functions/getGrade")(grade);
    // tempObject.length = await require("../functions/getLength")(length);

    PromisesTwo
    .push(require("../functions/getSize")(sizeOne, tempObject.pffType, "sizeOne"))
    .push(require("../functions/getSize")(sizeTwo, tempObject.pffType, "sizeTwo"))
    .push(require("../functions/getSize")(sizeThree, tempObject.pffType, "sizeThree"))
    .push(require("../functions/getEnd")(type, end, tempObject.pffType));
    await Promise.all(PromisesTwo).then(results => results.map(r => tempObject[r.key] = r.value));
    // tempObject.sizeOne = await require("../functions/getSize")(sizeOne, pffType);
    // tempObject.sizeTwo = await require("../functions/getSize")(sizeTwo, pffType);
    // tempObject.sizeThree = await require("../functions/getSize")(sizeThree, pffType);
    // tempObject.end = await require("../functions/getEnd")(tempObject.pffType, type, end);

    PromisesThree
    .push(require("../functions/getWall")(wallOne, tempObject.sizeOne.mm, "wallOne"))
    .push(require("../functions/getWall")(!!wallTwo ? wallTwo : !!sizeTwo ? wallOne : "", tempObject.sizeTwo.mm, "wallTwo"))
    .push(require("../functions/getWall")(wallOne, tempObject.sizeThree.mm, "wallThree"))
    .push(require("../functions/getType")(type, tempObject.sizeOne.mm))
    await Promise.all(PromisesThree).then(results => results.map(r => tempObject[r.key] = r.value));
    // tempObject.wallOne = await require("../functions/getWall")(tempObject.sizeOne.mm, wallOne);
    // tempObject.wallTwo = await require("../functions/getWall")(tempObject.sizeTwo.mm, !!wallTwo ? wallTwo : !!sizeTwo ? wallOne : "");
    // tempObject.wallThree = await require("../functions/getWall")(tempObject.sizeThree.mm, wallOne);
    // tempObject.type = await require("../functions/getType")(tempObject.sizeOne.mm, type);
    
    
    res.status(200).json({ "tempObject": tempObject});
});

module.exports = router;
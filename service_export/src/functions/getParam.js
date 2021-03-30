module.exports = (sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface) => {
    return new Promise(async function (resolve) {
        
        let myPromises = [];
        let tempObject = {}

        myPromises.push(require("../functions/getPff")(type));
        myPromises.push(require("../functions/getGrade")(grade));
        myPromises.push(require("../functions/getLength")(length));
        myPromises.push(require("../functions/getSurface")(surface));
        await Promise.all(myPromises).then(results => results.map(r => tempObject[r.key] = r.value));

        myPromises = [];
        myPromises.push(require("../functions/getSize")(sizeOne, tempObject.pffType, "sizeOne"));
        myPromises.push(require("../functions/getSize")(sizeTwo, tempObject.pffType, "sizeTwo"));
        myPromises.push(require("../functions/getSize")(sizeThree, tempObject.pffType, "sizeThree"));
        myPromises.push(require("../functions/getEnd")(type, end, tempObject.pffType));
        await Promise.all(myPromises).then(results => results.map(r => tempObject[r.key] = r.value));

        myPromises = [];
        myPromises.push(require("../functions/getWall")(wallOne, tempObject.sizeOne.mm, "wallOne"));
        myPromises.push(require("../functions/getWall")(wallTwo, tempObject.sizeTwo.mm, "wallTwo"));
        myPromises.push(require("../functions/getType")(type, tempObject.sizeOne.mm, tempObject.pffType));
        await Promise.all(myPromises).then(results => results.map(r => tempObject[r.key] = r.value));

        resolve({
            "sizeOne": tempObject.sizeOne,
            "sizeTwo": tempObject.sizeTwo,
            "sizeThree": tempObject.sizeThree,
            "wallOne": tempObject.wallOne,
            "wallTwo": tempObject.wallTwo,
            "type": tempObject.type,
            "grade": tempObject.grade,
            "length": tempObject.length,
            "end": tempObject.end,
            "surface": tempObject.surface
        });
    });
}
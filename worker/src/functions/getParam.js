module.exports = (sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface) => {
    return new Promise(async function (resolve) {
        
        let myPromises = [];
        let tempObject = {}

        myPromises.push(require("./getPff")(type));
        myPromises.push(require("./getGrade")(grade));
        myPromises.push(require("./getLength")(length));
        myPromises.push(require("./getSurface")(surface));
        await Promise.all(myPromises).then(results => results.map(r => tempObject[r.key] = r.value));

        myPromises = [];
        myPromises.push(require("./getSize")(sizeOne, tempObject.pffType, "sizeOne"));
        myPromises.push(require("./getSize")(sizeTwo, tempObject.pffType, "sizeTwo"));
        myPromises.push(require("./getSize")(sizeThree, tempObject.pffType, "sizeThree"));
        myPromises.push(require("./getEnd")(type, end, tempObject.pffType));
        await Promise.all(myPromises).then(results => results.map(r => tempObject[r.key] = r.value));

        myPromises = [];
        myPromises.push(require("./getWall")(wallOne, tempObject.sizeOne.mm, "wallOne"));
        myPromises.push(require("./getWall")(wallTwo, tempObject.sizeTwo.mm, "wallTwo"));
        myPromises.push(require("./getType")(type, tempObject.sizeOne.mm, tempObject.pffType));
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
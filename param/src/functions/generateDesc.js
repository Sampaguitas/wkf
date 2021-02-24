module.exports = function generateDesc(sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface){
    
    let tempObject = {}
    let pffType = require("./lookupPff")(type);
    tempObject.sizeOne = require("./lookupSize")(sizeOne, pffType);
    tempObject.sizeTwo = require("./lookupSize")(sizeTwo, pffType);
    tempObject.sizeThree = require("./lookupSize")(sizeThree, pffType);
    tempObject.wallOne = require("./generateWall")(tempObject.sizeOne.mm, wallOne);
    tempObject.wallTwo = require("./generateWall")(tempObject.sizeTwo.mm, !!wallTwo ? wallTwo : !!sizeTwo ? wallOne : "");
    tempObject.wallThree = require("./generateWall")(tempObject.sizeThree.mm, wallOne);
    tempObject.type = require("./generateType")(tempObject.sizeOne.mm, type);
    tempObject.grade = require("./lookupGrade")(grade);
    tempObject.length = require("./lookupLength")(length);
    tempObject.end = require("./lookupEnd")(tempObject.type, end);
    tempObject.surface = require("./lookupSurface")(surface);

    if (pffType === "FORGED_OLETS") {
        
        let sizeBefore = [[tempObject.sizeOne, tempObject.wallOne], [tempObject.sizeTwo, tempObject.wallTwo], [tempObject.sizeThree, tempObject.wallThree]]
        let sizeSorted = sizeBefore.sort(function(a,b) {
            if (a[0].mm === '') {
                return a[0].mm + b[0].mm
            } else {
                return a[0].mm - b[0].mm
            }
        });

        tempObject.sizeOne = sizeSorted[0][0];
        tempObject.sizeTwo = sizeSorted[1][0].mm === "" ? tempObject.sizeOne : sizeSorted[1][0];
        tempObject.sizeThree = sizeSorted[2][0].mm === "" ? tempObject.sizeTwo : sizeSorted[2][0];

        tempObject.wallOne = sizeSorted[0][1];
        tempObject.wallTwo = {"lunar":"FFF","name":"","tags":[],"mm":"" }
    } else {

        let sizeBefore = [[tempObject.sizeOne, tempObject.wallOne], [tempObject.sizeTwo, tempObject.wallTwo], [tempObject.sizeThree, tempObject.wallThree]]
        let sizeSorted = sizeBefore.sort(function(a,b) {
            return a[0].mm + b[0].mm
        });

        tempObject.sizeOne = sizeSorted[0][0];
        tempObject.sizeTwo = sizeSorted[1][0];
        tempObject.sizeThree = sizeSorted[2][0];

        tempObject.wallOne = sizeSorted[0][1];
        tempObject.wallTwo = sizeSorted[1][1];
    }
    
    delete tempObject.wallThree //remove the temp wall

    resObject = {
        "description": Object.keys(tempObject).reduce(function (acc, cur) {
            switch(cur) {
                case "sizeOne":
                    if (!!tempObject[cur].name) {
                        acc = tempObject[cur].name;
                    }
                    break;
                case "sizeTwo": 
                    if (!!tempObject[cur].name) {
                        acc = `${acc} X ${tempObject[cur].name}`;
                    }
                    break;
                case "sizeThree":
                    if (!!tempObject[cur].name) {
                        acc = tempObject.type.pffType === "FORGED_OLETS" ? `${acc} - ${tempObject[cur].name}` : `${acc} X ${tempObject[cur].name}`;
                    }
                    break;
                case "wallTwo":
                    if (!!tempObject[cur].name) {
                        acc = `${acc} X ${tempObject[cur].name}`;
                    }
                    break;
                default:
                    if (!!tempObject[cur].name) {
                        acc = `${acc} ${tempObject[cur].name}`;
                    }
            }
            return acc;
        },""),
        "vlunar": Object.keys(tempObject).reduce(function (acc, cur) {
            switch(cur) {
                case "length": return `${acc}FF${tempObject[cur].lunar}`;
                case "surface": return `${acc}${tempObject[cur].lunar}FFFFFF1`;
                default: return `${acc}${tempObject[cur].lunar}`;
            }
        }, ""),  
        "parameters": {
            "sizeOne": {
                "name": tempObject.sizeOne.name,
                "tags": tempObject.sizeOne.tags
            },
            "sizeTwo": {
                "name": tempObject.sizeTwo.name,
                "tags": tempObject.sizeTwo.tags
            },
            "sizeThree": {
                "name": tempObject.sizeThree.name,
                "tags": tempObject.sizeThree.tags
            },
            "wallOne": {
                "name": tempObject.wallOne.name,
                "tags": tempObject.wallOne.tags
            },
            "wallTwo": {
                "name": tempObject.wallTwo.name,
                "tags": tempObject.wallTwo.tags
            },
            "type": {
                "name": tempObject.type.name,
                "tags": tempObject.type.tags
            },
            "grade": {
                "name": tempObject.grade.name,
                "tags": tempObject.grade.tags
            },
            "length": {
                "name": tempObject.length.name,
                "tags": tempObject.length.tags
            },
            "end": {
                "name": tempObject.end.name,
                "tags": tempObject.end.tags,
            },
            "surface": {
                "name": tempObject.surface.name,
                "tags": tempObject.surface.tags,
            }
        }
    }
    
    return resObject;
}

// console.log(generateDesc("36\"", "3\"", "1/2\"", "STD", "", "WELDOL", "A105", ""));
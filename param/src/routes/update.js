const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const artNrs = JSON.parse(req.body.artNrs);
    const itemDescs = JSON.parse(req.body.itemDescs);
    const sizeOnes = JSON.parse(req.body.sizeOnes);
    const sizeTwos = JSON.parse(req.body.sizeTwos);
    const sizeThrees = JSON.parse(req.body.sizeThrees);
    const wallOnes = JSON.parse(req.body.wallOnes);
    const wallTwos = JSON.parse(req.body.wallTwos);
    const types = JSON.parse(req.body.types);
    const grades = JSON.parse(req.body.grades);
    const lengths = JSON.parse(req.body.lengths);
    const ends = JSON.parse(req.body.ends);
    const surfaces = JSON.parse(req.body.surfaces);

    let myPromises = [];
    let myPromisesTwo = [];
    let nRejected = 0;
    let nUpserted = 0;
    let rejections = [];

    require("../functions/processRefresh")().then( () => {
        require("../functions/processCheck")("update params").then( () => {
            require("../functions/processCreate")("update params", req.user.name).then(processId => {
                res.status(200).json({ "processId": processId });
                    
                for (let index = 0; index < artNrs.length; index++) {
                    let artNr = !!artNrs[index] ? artNrs[index] : "";
                    let itemDesc = !!itemDescs[index] ? itemDescs[index] : "";
                    let sizeOne = !!sizeOnes[index] ? sizeOnes[index] : "";
                    let sizeTwo = !!sizeTwos[index] ? sizeTwos[index] : "";
                    let sizeThree = !!sizeThrees[index] ? sizeThrees[index] : "";
                    let wallOne = !!wallOnes[index] ? wallOnes[index] : "";
                    let wallTwo = !!wallTwos[index] ? wallTwos[index] : "";
                    let type = !!types[index] ? types[index] : "";
                    let grade = !!grades[index] ? grades[index] : "";
                    let length = !!lengths[index] ? lengths[index] : "";
                    let end = !!ends[index] ? ends[index] : "";
                    let surface = !!surfaces[index] ? surfaces[index] : "";

                    myPromises.push(updateParam(artNr, itemDesc, sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface, processId, index, artNrs.length));
                }
        
                Promise.all(myPromises).then(myResults => {
                    myResults.map((result) => {
                        if (result.isRejected) {
                            nRejected++;
                            rejections.push({
                                "row": result.row,
                                "reason": result.reason
                            });
                        } else {
                            nUpserted++;
                        }
                    });
                    require("../functions/processFinalise")(processId, nRejected, nUpserted, rejections).then( () => console.log("done"))
                });
            }).catch(errCreate => res.status(400).json({ "message": errCreate.message }));
        }).catch(errCheck => res.status(400).json({"message": errCheck.message }));
    });
});

module.exports = router;

function updateParam(artNr, itemDesc, sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface, processId, index, length) {
    return new Promise(function(resolve) {
        require("../functions/processUpdate")(processId, index, length).then( () => {
            if (!artNr || !sizeOne || !type || !grade) {
                resolve({
                    "isRejected": true,
                    "row": index + 1,
                    "reason": "artNr, sizeOne, type or grade is missing."
                });
            } else {
                require("../functions/getParam")(sizeOne, sizeTwo, sizeThree, wallOne, wallTwo, type, grade, length, end, surface)
                .then(parameters => {
                    require("../models/Param").findOneAndUpdate({
                        "artNr": artNr
                    },
                    {
                        "description": !!itemDesc ? itemDesc : require("../functions/getDesc")(parameters),
                        "vlunar": require("../functions/getVlunar")(parameters),
                        "parameters": parameters
                    },
                    {
                        new: true, upsert: true 
                    }, function(errUpdate, resUpdate) {
                        if (!!errUpdate || !resUpdate) {
                            resolve({
                                "isRejected": true,
                                "row": index + 1,
                                "reason": "Could not update param."
                            });
                        } else {
                            resolve({
                                "isRejected": false
                            });
                        }
                    });
                });
            }
        });
    });
}
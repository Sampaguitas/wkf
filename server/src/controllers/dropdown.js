let regNps = /^(\d| |\/)*"$/
let regDn = /^DN \d*$/
let regMm = /^(\d|\.)* mm$/
let regIn = /^(\d|\.)* in$/
let regIdt = /^(STD|XS|XXS)$/

const artNr = (req, res, next) => {
    const opco = decodeURI(req.query.opco);
    const name = decodeURI(req.query.name);
    require("../models/Stock").distinct("artNr", {
        "opco": ["undefined", "OTHERS", ""].includes(opco) ? { "$exists": true } : opco,
        "artNr" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,"i") }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const currency = (req, res, next) => {
    const name = decodeURI(req.query.name);
    require("../models/Currency").distinct("_id", {
        "_id" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,"i") }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const end = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const name = decodeURI(req.query.name);
    require("../models/End").distinct("name", {
        "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
        "name" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,"i") }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const grade = (req, res, next) => {
    const steelType = decodeURI(req.query.steelType);
    const pffType = decodeURI(req.query.pffType);
    const isMultiple = decodeURI(req.query.isMultiple);
    const isComplete = decodeURI(req.query.isComplete);
    const name = decodeURI(req.query.name);
    require("../models/Grade").distinct("name", {
        "steelType": ["undefined", "OTHERS", ""].includes(steelType) ? { "$exists": true } : steelType,
        "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
        "isComplete": isComplete === "true" ? true : { "$exists": true },
        "isMultiple": isMultiple === "false" ? false : { "$exists": true },
        "name" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,"i") }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const length = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const name = decodeURI(req.query.name);
    require("../models/Length").aggregate([
        { 
            "$match": { 
                "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
                "name" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
            }
        },
        { "$sort": { "_id": 1 } },
        { "$group": { "_id": "$key", "names": { "$push": "$name" } } },
    ]).exec(function (error, result) {
        if (!!error || result.length < 1) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result[0].names);
        }
    });
}

const opco = (req, res, next) => {
    const name = decodeURI(req.query.name);
    require("../models/Stock").distinct("opco", {
        "opco" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,"i") }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const pffType = (req, res, next) => {
    const name = decodeURI(req.query.name);
    require("../models/Pff").distinct("name",{
        "name" : { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const sizeOne = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const name = decodeURI(req.query.name);
    require("../models/Size").aggregate([
        { "$unwind": "$tags" },
        {
            "$match": {
                "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
                "tags": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
            }
        },
        { "$sort": { "_id" : 1 } },
        { "$group" : { "_id" : "$key", "tags" : { "$push" : "$tags" } } }
    ])
    .exec(function(error, result) {
        if(!!error || result.length < 1) {
            res.status(200).json([]);
        } else {
            let temp = result[0].tags.reduce(function(acc, cur) {
                if(regNps.test(cur)) {
                    acc.nps.push(cur);
                } else if(regDn.test(cur)) {
                    acc.dn.push(cur);
                } else if(regMm.test(cur)) {
                    acc.mm.push(cur);
                } else if(regIn.test(cur)) {
                    acc.in.push(cur);
                } else {
                    acc.other.push(cur);
                }
                return acc;
            }, { "nps": [], "dn": [], "mm": [], "in": [], "other": [] });
            res.status(200).json(
                [...temp.nps, ...temp.dn, ...temp.mm, ...temp.in, ...temp.other]
                .filter((value, index, self) => self.indexOf(value) === index)
            );
        }
    });
}

const sizeThree = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const sizeTwo = decodeURI(req.query.sizeTwo);
    const name = decodeURI(req.query.name);
    if (!["FORGED_OLETS", "OTHERS", "undefined", ""].includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeTwo)) {
        res.status(200).json([])
    } else {
        require("../models/Size").findOne({
            "tags": sizeTwo,
            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType // ----> new
        }, function (errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../models/Size").aggregate([
                    { "$unwind": "$tags" },
                    {
                        "$match": {
                            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
                            "mm": ["undefined", "OTHERS", ""].includes(pffType) ? { "$ne": null } : pffType === "FORGED_OLETS" ? { "$gte": resTempOne.mm } : { "$lt": resTempOne.mm },
                            "tags": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
                        }
                    },
                    { "$sort": { "_id": 1 } },
                    { "$group": { "_id": "$key", "tags": { "$push": "$tags" } } }
                ]).exec(function (error, result) {
                    if (!!error || result.length < 1) {
                        res.status(200).json([]);
                    } else {
                        let temp = result[0].tags.reduce(function (acc, cur) {
                            if (regNps.test(cur)) {
                                acc.nps.push(cur);
                            } else if (regDn.test(cur)) {
                                acc.dn.push(cur);
                            } else if (regMm.test(cur)) {
                                acc.mm.push(cur);
                            } else if (regIn.test(cur)) {
                                acc.in.push(cur);
                            } else {
                                acc.other.push(cur);
                            }
                            return acc;
                        }, { "nps": [], "dn": [], "mm": [], "in": [], "other": [] });
                        res.status(200).json(
                            [...temp.nps, ...temp.dn, ...temp.mm, ...temp.in, ...temp.other]
                            .filter((value, index, self) => self.indexOf(value) === index)
                        );
                    }
                });
            }
        });
    }
}

const sizeTwo = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const sizeOne = decodeURI(req.query.sizeOne);
    const name = decodeURI(req.query.name);
    let noPffTwo = ["PIPES", "PIPE_NIPPLES", "LINE_BLANKS", "FASTENERS", "RING_GASKETS", "SW_GASKETS"]
    if (noPffTwo.includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeOne)) {
        res.status(200).json([])
    } else {
        require("../models/Size").findOne({
            "tags": sizeOne,
            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType // ----> new
        }, function (errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../models/Size").aggregate([
                    { "$unwind": "$tags" },
                    {
                        "$match": {
                            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
                            "mm": ["undefined", "OTHERS", ""].includes(pffType) ? { "$ne": null } : pffType === "FORGED_OLETS" ? { "$gte": resTempOne.mm } : { "$lt": resTempOne.mm },
                            "tags": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
                        }
                    },
                    { "$sort": { "_id": 1 } },
                    { "$group": { "_id": "$key", "tags": { "$push": "$tags" } } }
                ]).exec(function (error, result) {
                    if (!!error || result.length < 1) {
                        res.status(200).json([]);
                    } else {
                        let temp = result[0].tags.reduce(function (acc, cur) {
                            if (regNps.test(cur)) {
                                acc.nps.push(cur);
                            } else if (regDn.test(cur)) {
                                acc.dn.push(cur);
                            } else if (regMm.test(cur)) {
                                acc.mm.push(cur);
                            } else if (regIn.test(cur)) {
                                acc.in.push(cur);
                            } else {
                                acc.other.push(cur);
                            }
                            return acc;
                        }, { "nps": [], "dn": [], "mm": [], "in": [], "other": [] });
                        res.status(200).json(
                            [...temp.nps, ...temp.dn, ...temp.mm, ...temp.in, ...temp.other]
                            .filter((value, index, self) => self.indexOf(value) === index)
                        );
                    }
                });
            }
        });
    }
}

const steelType = (req, res, next) => {
    const name = decodeURI(req.query.name);
    require("../models/Steel").distinct("name", {
        "name": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const surface = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const name = decodeURI(req.query.name);
    require("../models/Surface").distinct("name", {
        "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
        "name": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const type = (req, res, next) => {
    const pffType = decodeURI(req.query.pffType);
    const isMultiple = decodeURI(req.query.isMultiple);
    const isComplete = decodeURI(req.query.isComplete);
    const name = decodeURI(req.query.name);
    require("../models/Type").distinct("name", {
        "pffType": ["undefined", "OTHERS", ""].includes(pffType) ? { $exists: true } : pffType,
        "isMultiple": isMultiple === "false" ? false : { $exists: true },
        "isComplete": isComplete === "true" ? true : { $exists: true },
        "name": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
    }).exec(function (error, result) {
        if (!!error || !result) {
            res.status(200).json([]);
        } else {
            res.status(200).json(result.sort((a, b) => a.localeCompare(b)));
        }
    });
}

const wallOne = (req, res, next) => {
    const steelType = decodeURI(req.query.steelType);
    const pffType = decodeURI(req.query.pffType);
    const sizeOne = decodeURI(req.query.sizeOne);
    const name = decodeURI(req.query.name);
    let regSch = ["CARBON_STEEL", "LOW_TEMP", "LOW_ALLOY"].includes(steelType) ? /^S\d*$/ : /^S\d*S?$/
    let noWallOne = ["FORGED_FITTINGS", "MI_FITTINGS", "LINE_BLANKS", "SW_GASKETS", "FASTENERS", "RING_GASKETS"];
    if (noWallOne.includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeOne)) {
        res.status(200).json([])
    } else {
        require("../models/Size").findOne({
            "tags": sizeOne,
            "mm": { "$ne": null },
            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType // ----> new
        }, function (errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../models/Wall").aggregate([
                    { "$unwind": "$tags" },
                    {
                        "$match": {
                            "sizeId": resTempOne.mm,
                            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
                            "tags": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
                        }
                    },
                    { "$sort": { "_id": 1 } },
                    { "$group": { "_id": "$key", "tags": { "$push": "$tags" } } }
                ]).exec(function (error, result) {
                    if (!!error || result.length < 1) {
                        res.status(200).json([]);
                    } else {
                        let temp = result[0].tags.reduce(function (acc, cur) {
                            if (regMm.test(cur)) {
                                acc.mm.push(cur);
                            } else if (regIn.test(cur)) {
                                acc.in.push(cur);
                            } else if (regIdt.test(cur)) {
                                acc.idt.push(cur);
                            } else if (regSch.test(cur)) {
                                acc.sch.push(cur);
                            }
                            return acc;
                        }, {
                            "mm": [], "in": [], "idt": [], "sch": []
                        });
                        res.status(200).json(
                            [...temp.idt, ...temp.sch, ...temp.mm, ...temp.in]
                            .filter((value, index, self) => self.indexOf(value) === index)
                        );
                    }
                });
            }
        });
    }
}

const wallTwo = (req, res, next) => {
    const steelType = decodeURI(req.query.steelType);
    const pffType = decodeURI(req.query.pffType);
    const sizeTwo = decodeURI(req.query.sizeTwo);
    const name = decodeURI(req.query.name);
    let regSch = ["CARBON_STEEL", "LOW_TEMP", "LOW_ALLOY"].includes(steelType) ? /^S\d*$/ : /^S\d*S?$/
    let noWallTwo = ["PIPES", "PIPE_NIPPLES", "FORGED_FITTINGS", "FORGED_OLETS", "FORGED_FLANGES", "EN_FLANGES", "LINE_BLANKS", "MI_FITTINGS", "SW_GASKETS", "FASTENERS", "RING_GASKETS"];
    if (noWallTwo.includes(pffType) || ["undefined", "OTHERS", ""].includes(sizeTwo)) {
        res.status(200).json([])
    } else {
        require("../models/Size").findOne({
            "tags": sizeTwo,
            "mm": { "$ne": null },
            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType // ----> new
        }, function (errTempOne, resTempOne) {
            if (errTempOne || !resTempOne) {
                res.status(200).json([]);
            } else {
                require("../models/Wall").aggregate([
                    { "$unwind": "$tags" },
                    {
                        "$match": {
                            "sizeId": resTempOne.mm,
                            "pffTypes": ["undefined", "OTHERS", ""].includes(pffType) ? { "$exists": true } : pffType,
                            "tags": { "$regex": new RegExp(`^${require("../functions/escape")(name)}`,'i') }
                        }
                    },
                    { "$sort": { "_id": 1 } },
                    { "$group": { "_id": "$key", "tags": { "$push": "$tags" } } }
                ]).exec(function (error, result) {
                    if (!!error || result.length < 1) {
                        res.status(200).json([]);
                    } else {
                        let temp = result[0].tags.reduce(function (acc, cur) {
                            if (regMm.test(cur)) {
                                acc.mm.push(cur);
                            } else if (regIn.test(cur)) {
                                acc.in.push(cur);
                            } else if (regIdt.test(cur)) {
                                acc.idt.push(cur);
                            } else if (regSch.test(cur)) {
                                acc.sch.push(cur);
                            }
                            return acc;
                        }, {
                            "mm": [], "in": [], "idt": [], "sch": []
                        });
                        res.status(200).json(
                            [...temp.idt, ...temp.sch, ...temp.mm, ...temp.in]
                            .filter((value, index, self) => self.indexOf(value) === index)
                        );
                    }
                });
            }
        });
    }
}




const dropdownController = {
    artNr,
    currency,
    end,
    grade,
    length,
    opco,
    pffType,
    sizeOne,
    sizeThree,
    sizeTwo,
    steelType,
    surface,
    type,
    wallOne,
    wallTwo
};

module.exports = dropdownController;


module.exports = (sizeOne, item) => {
    return new Promise(function(resolve) {
        switch(item) {
            case "THR FL 400":
            case "THR FL 600":
                if (sizeOne < 114.3) { //below 4"
                    resolve({
                        "lunar": "FFF",
                        "name": "THR FL 400/600",
                        "tags": ["THR FL 400", "THR FL 600"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "SOF 400":
            case "SOF 600":
                if (sizeOne < 114.3) { //below 4"
                    resolve({
                        "lunar": "FFF",
                        "name": "SOF 400/600",
                        "tags": ["SOF 400", "SOF 600"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "LAPJ 400":
            case "LAPJ 600":
                if (sizeOne < 114.3) { //below 4"
                    resolve({
                        "lunar": "FFF",
                        "name": "LAPJ 400/600",
                        "tags": ["LAPJ 400", "LAPJ 600"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "BLF 400":
            case "BLF 600":
                if (sizeOne < 114.3) { //below 4"
                    resolve({
                        "lunar": "FFF",
                        "name": "BLF 400/600",
                        "tags": ["BLF 400", "BLF 600"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "WNF 400":
            case "WNF 600":
                if (sizeOne < 114.3) { //below 4"
                    resolve({
                        "lunar": "FFF",
                        "name": "WNF 400/600",
                        "tags": ["WNF 400", "WNF 600"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //ASME B16.2017 (CL900 / CL1500)
            case "THR FL 900":
            case "THR FL 1500":
                if (sizeOne < 88.9) { //below 3"
                    resolve({
                        "lunar": "6C3",
                        "name": "THR FL 900/1500",
                        "tags": ["THR FL 900", "THR FL 1500"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "SOF 900":
            case "SOF 1500":
                if (sizeOne < 88.9) { //below 3"
                    resolve({
                        "lunar": "FFF",
                        "name": "SOF 900/1500",
                        "tags": ["SOF 900", "SOF 1500"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "LAPJ 900":
            case "LAPJ 1500":
                if (sizeOne < 88.9) { //below 3"
                    resolve({
                        "lunar": "FFF",
                        "name": "LAPJ 900/1500",
                        "tags": ["LAPJ 900", "LAPJ 1500"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "BLF 900":
            case "BLF 1500":
                if (sizeOne < 88.9) { //below 3"
                    resolve({
                        "lunar": "6C1",
                        "name": "BLF 900/1500",
                        "tags": ["BLF 900", "BLF 1500"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "WNF 900":
            case "WNF 1500":
                if (sizeOne < 88.9) { //below 3"
                    resolve({
                        "lunar": "6C0",
                        "name": "WNF 900/1500",
                        "tags": ["WNF 900", "WNF 1500"],
                        "pffType": "FORGED_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //----------------------EN 1092-1----------------------// 
            ////EN 1092-1 (Type 01 flanges: Plate flange for welding)
            case "FWF (1) PN 2.5":
            case "FWF (1) PN 6":
                if (sizeOne <= 1016){ //sizeOne <= DN 1000
                    resolve({
                        "lunar": "FFF",
                        "name": "FWF (1) PN 2.5/6",
                        "tags": ["FWF (1) PN 2.5", "FWF (1) PN 6"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "FWF (1) PN 10":
            case "FWF (1) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "655",
                        "name": "FWF (1) PN 10/16/25/40",
                        "tags": ["FWF (1) PN 10", "FWF (1) PN 16", "FWF (1) PN 25", "FWF (1) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "654",
                        "name": "FWF (1) PN 10/16",
                        "tags": ["FWF (1) PN 10", "FWF (1) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "FWF (1) PN 25":
            case "FWF (1) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "655",
                        "name": "FWF (1) PN 10/16/25/40",
                        "tags": ["FWF (1) PN 10", "FWF (1) PN 16", "FWF (1) PN 25", "FWF (1) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "658",
                        "name": "FWF (1) PN 25/40",
                        "tags": ["FWF (1) PN 25", "FWF (1) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "FWF (1) PN 63":
            case "FWF (1) PN 100":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "65B",
                        "name": "FWF (1) PN 63/100",
                        "tags": ["FWF (1) PN 63", "FWF (1) PN 100"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //EN 1092-1 (Type 02 flanges: Loose plate flange with weld-on plate collar or for lapped pipe end)
            case "LPF (2) PN 2.5":
            case "LPF (2) PN 6":
                if (sizeOne <= 610){ //sizeOne <= DN600
                    resolve({
                        "lunar": "FFF",
                        "name": "LPF (2) PN 2.5/6",
                        "tags": ["LPF (2) PN 2.5", "LPF (2) PN 6"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "LPF (2) PN 10":
            case "LPF (2) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "65F",
                        "name": "LPF (2) PN 10/16/25/40",
                        "tags": ["LPF (2) PN 10", "LPF (2) PN 16", "LPF (2) PN 25", "LPF (2) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "65E",
                        "name": "LPF (2) PN 10/16",
                        "tags": ["LPF (2) PN 10", "LPF (2) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "LPF (2) PN 25":
            case "LPF (2) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "65F",
                        "name": "LPF (2) PN 10/16/25/40",
                        "tags": ["LPF (2) PN 10", "LPF (2) PN 16", "LPF (2) PN 25", "LPF (2) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "662",
                        "name": "LPF (2) PN 25/40",
                        "tags": ["LPF (2) PN 25", "LPF (2) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //EN 1092-1 (Type 04 flanges: Loose plate flange with weld-neck collar)
            case "LPF (4) PN 10":
            case "LPF (4) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "666",
                        "name": "LPF (4) PN 10/16/25/40", 
                        "tags": ["LPF (4) PN 10", "LPF (4) PN 16", "LPF (4) PN 25", "LPF (4) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "665",
                        "name": "LPF (4) PN 10/16", 
                        "tags": ["LPF (4) PN 10", "LPF (4) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "LPF (4) PN 25":
            case "LPF (4) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "666",
                        "name": "LPF (4) PN 10/16/25/40", 
                        "tags": ["LPF (4) PN 10", "LPF (4) PN 16", "LPF (4) PN 25", "LPF (4) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "669",
                        "name": "LPF (4) PN 25/40",
                        "tags": ["LPF (4) PN 25", "LPF (4) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "LPF (4) PN 63":
            case "LPF (4) PN 100":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "FFF",
                        "name": "LPF (4) PN 63/100",
                        "tags": ["LPF (4) PN 63", "LPF (4) PN 100"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //EN 1092-1 (Type 5 flanges: Blind flange)
            case "BLF (5) PN 2.5":
            case "BLF (5) PN 6":
                if (sizeOne <= 1016){ //sizeOne <= DN1000
                    resolve({
                        "lunar": "FFF",
                        "name": "BLF (5) PN 2.5/6",
                        "tags": ["BLF (5) PN 2.5", "BLF (5) PN 6"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "BLF (5) PN 10":
            case "BLF (5) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "66D",
                        "name": "BLF (5) PN 10/16/25/40",
                        "tags": ["BLF (5) PN 10", "BLF (5) PN 16", "BLF (5) PN 25", "BLF (5) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "66C",
                        "name": "BLF (5) PN 10/16",
                        "tags": ["BLF (5) PN 10", "BLF (5) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "BLF (5) PN 25":
            case "BLF (5) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "66D",
                        "name": "BLF (5) PN 10/16/25/40",
                        "tags": ["BLF (5) PN 10", "BLF (5) PN 16", "BLF (5) PN 25", "BLF (5) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "670",
                        "name": "BLF (5) PN 25/40",
                        "tags": ["BLF (5) PN 25", "BLF (5) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "BLF (5) PN 63":
            case "BLF (5) PN 100":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "673",
                        "name": "BLF (5) PN 63/100",
                        "tags": ["BLF (5) PN 63", "BLF (5) PN 100"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "BLF (5) PN 250":
            case "BLF (5) PN 320":
                if (sizeOne <= 17.1){ //sizeOne <= DN10
                    resolve({
                        "lunar": "FFF",
                        "name": "BLF (5) PN 250/320",
                        "tags": ["BLF (5) PN 250", "BLF (5) PN 320"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //EN 1092-1 (Type 11 flanges: Weld-neck flange)
            case "WNF (11) PN 2.5":
            case "WNF (11) PN 6":
                if (sizeOne <= 813){ //sizeOne <= DN800
                    resolve({
                        "lunar": "FFF",
                        "name": "WNF (11) PN 2.5/6",
                        "tags": ["WNF (11) PN 2.5", "WNF (11) PN 6"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "WNF (11) PN 10":
            case "WNF (11) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "677",
                        "name": "WNF (11) PN 10/16/25/40",
                        "tags": ["WNF (11) PN 10", "WNF (11) PN 16", "WNF (11) PN 25", "WNF (11) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "676",
                        "name": "WNF (11) PN 10/16",
                        "tags": ["WNF (11) PN 10", "WNF (11) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "WNF (11) PN 25":
            case "WNF (11) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "677",
                        "name": "WNF (11) PN 10/16/25/40",
                        "tags": ["WNF (11) PN 10", "WNF (11) PN 16", "WNF (11) PN 25", "WNF (11) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "67A",
                        "name": "WNF (11) PN 25/40",
                        "tags": ["WNF (11) PN 25", "WNF (11) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "WNF (11) PN 63":
            case "WNF (11) PN 100":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "67D",
                        "name": "WNF (11) PN 63/100",
                        "tags": ["WNF (11) PN 63", "WNF (11) PN 100"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "WNF (11) PN 250":
            case "WNF (11) PN 320":
                if (sizeOne <= 17.1){ //sizeOne <= DN10
                    resolve({
                        "lunar": "681",
                        "name": "WNF (11) PN 250/320",
                        "tags": ["WNF (11) PN 250", "WNF (11) PN 320"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //EN 1092-1 (Type 12 flanges: Hubbed slip-on flange for welding)
            case "SOF (12) PN 10":
            case "SOF (12) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "695",
                        "name": "SOF (12) PN 10/16/25/40",
                        "tags": ["SOF (12) PN 10", "SOF (12) PN 16", "SOF (12) PN 25", "SOF (12) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "694",
                        "name": "SOF (12) PN 10/16",
                        "tags": ["SOF (12) PN 10", "SOF (12) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "SOF (12) PN 25":
            case "SOF (12) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "695",
                        "name": "SOF (12) PN 10/16/25/40",
                        "tags": ["SOF (12) PN 10", "SOF (12) PN 16", "SOF (12) PN 25", "SOF (12) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "698",
                        "name": "SOF (12) PN 25/40",
                        "tags": ["SOF (12) PN 25", "SOF (12) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "SOF (12) PN 63":
            case "SOF (12) PN 100":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "69B",
                        "name": "SOF (12) PN 63",
                        "tags": ["SOF (12) PN 63", "SOF (12) PN 100"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            //EN 1092-1 (Type 13 flanges: Hubbed threaded flange)
            case "THR FL (13) PN 10":
            case "THR FL (13) PN 16":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "69F",
                        "name": "THR FL (13) PN 10/16/25/40",
                        "tags": ["THR FL (13) PN 10", "THR FL (13) PN 16", "THR FL (13) PN 25", "THR FL (13) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "69E",
                        "name": "THR FL (13) PN 10/16",
                        "tags": ["THR FL (13) PN 10", "THR FL (13) PN 16"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "THR FL (13) PN 25":
            case "THR FL (13) PN 40":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "69F",
                        "name": "THR FL (13) PN 10/16/25/40",
                        "tags": ["THR FL (13) PN 10", "THR FL (13) PN 16", "THR FL (13) PN 25", "THR FL (13) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else if(sizeOne >= 60.3 && sizeOne <= 168.3) { //DN 50 >= sizeOne <= DN150"
                    resolve({
                        "lunar": "6A2",
                        "name": "THR FL (13) PN 25/40",
                        "tags": ["THR FL (13) PN 25", "THR FL (13) PN 40"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            case "THR FL (13) PN 63":
            case "THR FL (13) PN 100":
                if (sizeOne <= 48.3){ //sizeOne <= DN40
                    resolve({
                        "lunar": "6A5",
                        "name": "THR FL (13) PN 63/100",
                        "tags": ["THR FL (13) PN 63", "THR FL (13) PN 100"],
                        "pffType": "EN_FLANGES"
                    });
                } else {
                    resolve(findType(item));
                }
            default: resolve(findType(item));
        }
    });
}

function findType(type) {
    return new Promise(function(resolve) {
        require("../models/Type").findOne({name: type}, function(err, res) {
            if (!!err || !res) {
                resolve({
                    'lunar': 'FFF',
                    'name': type,
                    'tags': type ? [type] : [],
                    'pffType': 'OTHER'
                });
            } else {
                resolve({
                    'lunar': res.lunar,
                    'name': type,
                    'tags': res.tags,
                    'pffType': res.pffType,
                });
            }
        });
    });
}
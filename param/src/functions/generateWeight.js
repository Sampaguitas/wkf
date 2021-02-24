module.exports = function generateWeight(uom, weight){
    switch(uom) {
        case "LB": return weight * 0.4535924;
        case "FT": return weight * 0.3048;
        default: return weight; //"ST", "KG", "M":
    }
}
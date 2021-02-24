module.exports = function generateWeight(uom){
    switch(uom) {
        case "KG":
        case "LB": return "KG";
        case "M":
        case "FT": return "M";
        default: return "ST"; //"ST":
    }
}
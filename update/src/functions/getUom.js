module.exports = (uom) => {
    switch(uom) {
        case "KG":
        case "LB": return "KG";
        case "M":
        case "FT": return "M";
        default: return "ST"; //"ST":
    }
}
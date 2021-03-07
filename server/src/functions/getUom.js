module.exports = (system, uom) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG":
            case "LB": return "LB";
            case "M":
            case "FT": return "FT";
            default: return "ST"; //"ST":
        }
    } else {
        return uom;
    }
}
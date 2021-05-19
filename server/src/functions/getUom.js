module.exports = (system, uom) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return "LB";
            case "LB": return "LB";
            case "M": return "FT";
            case "FT": return "FT";
            default: return "ST"; //"ST":
        }
    } else {
        return uom;
    }
}
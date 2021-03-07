module.exports = (system, uom, weight) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return weight / 0.4535924;
            case "M": return weight / 0.3048;
            default: return weight; //"ST", "LB", "FT":
        }
    } else {
        return weight;
    }
}
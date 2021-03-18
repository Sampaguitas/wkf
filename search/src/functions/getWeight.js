module.exports = (system, uom, weight) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return weight * 2.204623;
            case "M": return weight * 0.671969;
            default: return weight; //"ST", "LB", "FT":
        }
    } else {
        return weight;
    }
}
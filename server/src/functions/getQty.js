module.exports = (system, uom, qty) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return qty / 0.4535924;
            case "M": return qty / 0.3048;
            default: return qty; //"ST" "LB" "FT"
        }
    } else {
        return qty;
    }
}
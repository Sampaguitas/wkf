module.exports = (system, uom, qty) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return qty * 2.204623;
            case "M": return qty * 3.28084;
            default: return qty; //"ST" "LB" "FT"
        }
    } else {
        return qty;
    }
}
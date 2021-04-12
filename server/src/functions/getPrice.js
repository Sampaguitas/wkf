module.exports = (system, uom, price, rate) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return (price * rate) * 2.204623;
            case "M": return (price * rate) * 3.28084;
            default: return qty; //"ST" "LB" "FT"
        }
    } else {
        return (price * rate);
    }
}
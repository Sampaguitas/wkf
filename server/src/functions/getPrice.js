module.exports = (system, uom, price, rate) => {
    if (system === "IMPERIAL") {
        switch(uom) {
            case "KG": return (price * rate) / 0.4535924;
            case "M": return (price * rate) / 0.3048;
            default: return qty; //"ST" "LB" "FT"
        }
    } else {
        return (price * rate);
    }
}
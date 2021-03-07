module.exports = (uom, qty) => {
    switch(uom) {
        case "LB": return qty / 2.204623;
        case "FT": return qty / 3.28084;
        default: return qty; //"ST" "KG" "M"
    }
}
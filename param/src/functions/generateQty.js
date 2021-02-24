module.exports = function generateQty(uom, qty){
    switch(uom) {
        case "LB": return qty * 0.4535924;
        case "FT": return qty * 0.3048;
        default: return qty; //"ST" "KG" "M"
    }
}
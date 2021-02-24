module.exports = function generatePrice(uom, price, rate){
    switch(uom) {
        case "LB": return(price * rate * 0.4535924);
        case "FT": return(price * rate * 0.3048);
        default: return(price * rate);//"ST" "KG" "M"
    }
}
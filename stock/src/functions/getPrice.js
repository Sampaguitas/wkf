module.exports = (uom, price, rate) => {
    switch(uom) {
        case "LB": return (price * rate) / 2.204623;
        case "FT": return(price * rate) / 3.28084;
        default: return(price * rate);//"ST" "KG" "M"
    }
}
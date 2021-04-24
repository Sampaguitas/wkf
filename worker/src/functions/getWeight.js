module.exports = (system, uom, weight) => {
    switch(uom) {
        case "LB": return weight / 2.204623;
        case "FT": return weight / 0.671969;
        default: return system === "IMPERIAL" ? weight / 2.204623 : weight; //"ST", "KG", "M":
    }
}
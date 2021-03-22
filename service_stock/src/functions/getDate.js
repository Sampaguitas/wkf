module.exports = (excelDate) => {
    let parced = Number(String(excelDate).trim());
    let temp = new Date((Number(parced) - (25567 + 1))*86400*1000);
    if ([ 2958463, 0 ].includes(parced) || temp == "Invalid Date") {
        return "";
    } else {
        return temp;
    }
}
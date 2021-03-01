// string.replace(/^\0+/, '').replace(/\0+$/, '')
module.exports = (myString) => {
    return String(myString).trim().replace("\u0000", "");
}
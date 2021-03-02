module.exports = (myString) => {
    return String(myString).replace("?", "").trim().replace("\u0000", "");
}
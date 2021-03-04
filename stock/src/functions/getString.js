module.exports = (myString) => {
    return String(myString).replace(/\?*/g, "").replace(/\u0000*/g, "").trim();
}
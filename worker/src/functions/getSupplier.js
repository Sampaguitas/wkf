module.exports = (myString) => {
    return String(myString).replace(/(\?*|\u0000*|^\"|\"$|\( *\)| {2})*/g, "").trim();
}
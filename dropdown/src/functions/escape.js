module.exports = (string) => {
    return string != "undefined" ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
}
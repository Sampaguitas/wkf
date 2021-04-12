module.exports = (element) => {
    switch (element) {
        case "false": return [false];
        case "true": return [true];
        default: return [true, false, undefined];
    }
}
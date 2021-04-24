module.exports = (processId, lines, message, rejections) => {
    return new Promise(function(resolve) {
        require("../models/Import").findByIdAndUpdate(processId, {
            "status": "complete",
            "lines": lines,
            "message": message,
            "rejections": rejections
        }, () => resolve());
    });
}
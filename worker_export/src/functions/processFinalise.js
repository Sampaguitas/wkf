module.exports = (processId, lines) => {
    return new Promise(function(resolve) {
        require("../models/Export").findByIdAndUpdate(processId, {
            "status": "complete",
            "lines": lines
        }, () => resolve());
    });
}
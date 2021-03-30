module.exports = (processId, message, rejections) => {
    return new Promise(function(resolve) {
        require("../models/Process").findByIdAndUpdate(processId, {
            "progress": 1,
            "isStalled": false,
            "message": message,
            rejections: rejections
        }, () => resolve());
    });
}
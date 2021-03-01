module.exports = (processId, nRejected, nUpserted, rejections) => {
    return new Promise(function(resolve) {
        let message = `${nRejected + nUpserted} processed, ${nRejected} rejected, ${nUpserted} upserted.`;
        require("../models/Process").findByIdAndUpdate(processId, {
            "progress": 1,
            "isStalled": false,
            "message": message,
            rejections: rejections
        }, () => resolve());
    });
}
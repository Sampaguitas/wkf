module.exports = (documentId) => {
    return new Promise(function(resolve) {
        require("../models/Export").findByIdAndUpdate(documentId, {
            "status": "failed",
        }, () => resolve());
    });
}
module.exports = (documentId) => {
    return new Promise(function(resolve) {
        require("../models/Import").findByIdAndUpdate(documentId, {
            "status": "failed",
        }, () => resolve());
    });
}
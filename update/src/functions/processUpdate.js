module.exports = (processId, index, length) => {
    return new Promise(function(resolve) {
        let progress = Math.min(Math.max(index / (length -1), 0), 1);
        require("../models/Process").findOneAndUpdate({
            "_id" : processId
        },
        { 
            "progress": progress,
            "isStalled": false,
            "message": `${Math.round(progress * 100)}% complete`
        },
        {
            "new": true, "upsert": true
        }, () => resolve());
    });
}
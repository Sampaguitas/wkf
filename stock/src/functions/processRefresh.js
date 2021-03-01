module.exports = ()  => {
    return new Promise(function(resolve) {
        require('../models/Process').updateMany({
            "progress": { $ne: 1 },
            "message": { $ne: "100% complete" },
            "isStalled": false,
            "updatedAt": { $lt: new Date() - 3000 }
        },
        {
            $set: { "isStalled": true, "message": "stalled" }
        }, () => resolve());
    });
}
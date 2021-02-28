module.exports = ()  => {
    return new Promise(function(resolve) {
        require('../models/Process').updateMany({
            "progress": { $ne: 1 }, 
            "isStalled": false, 
            "updatedAt": { $lt: new Date() - 3000 }
        },
        {
            $set: { "isStalled": true, "message": "stalled" }
        }, () => resolve());
    });
}
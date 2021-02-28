const Process = require("../models/Process");

module.exports = (processType, name) => {
    return new Promise(function(resolve, reject) {
        let newProcess = new Process({
            "user": name,
            "process_type": processType, 
            "progress": 0,
            "isStalled": false,
            "message": "process started.",
        });

        newProcess.save()
        .then(res => resolve(res._id))
        .catch(err => reject({"message": "could not create new process."}));
    });
}
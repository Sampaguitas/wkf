module.exports = () => {
    return new Promise(function (resolve) {
        let myPromises = [];
        require("../models/Export")
        .find({ "expiresAt": { "$lt": new Date() } })
        .then(expired => {
            expired.map(e => {
                myPromises.push(require("./s3delete")("exports", e._id, ".xlsx"));
                myPromises.push(require("../models/Export").findOneAndDelete({ "_id": e._id }));
            });
            Promise.all(myPromises).then( () => resolve());
        }).catch( () => resolve());
    });
};


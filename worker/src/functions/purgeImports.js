module.exports = () => {
    return new Promise(function(resolve) {
        let myPromises = [];
        require("../models/Import")
        .find({ "expiresAt": { "$lt": new Date() } })
        .then(expired => {
            expired.map(e => {
                myPromises.push(require("./s3delete")("imports", e._id, getExt(e.type)));
                myPromises.push(require("../models/Import").findOneAndDelete({ "_id": e._id }, () => resolve()));
            });
            Promise.all(myPromises).then( () => resolve());
        }).catch( () => resolve());
    });
};

function getExt(type) {
    switch (type) {
      case "stocks": return ".txt";
      case "params": return ".xlsx";
      default: return "";
    }
}
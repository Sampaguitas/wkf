const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExportSchema = new Schema({
    "items": {
        type: Number,
        default: 0
    },
    "exportType": String,
    "progress": {
        type: Number,
        default: 0
    },
    "userId": String,
    "message": String
},
{
    timestamps: true
});

module.exports= Export = mongoose.model('exports', ExportSchema);
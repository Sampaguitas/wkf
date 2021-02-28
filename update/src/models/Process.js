const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const ProcessSchema = new Schema({
    "user": String,
    "process_type": String,
    "progress": {
        type: Number,
        default: 0
    },
    "isStalled": {
        type: Boolean,
        default: false
    },
    "message": String,
    "rejections": [{
        "row": Number,
        "reason": String,
    }]
},
{
    timestamps: true
});

module.exports= Process = mongoose.model('Processes', ProcessSchema);
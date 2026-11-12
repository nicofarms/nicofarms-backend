const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    office: {
        type: String,
        default: "staff"
    },
    briefIntro: {
        type: String,
        default: ""
    },
    detailedIntro: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
}, { timestamps: true });
module.exports = mongoose.model("Staff", staffSchema);
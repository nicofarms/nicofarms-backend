const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  youtubeUrl: { type: String, required: true, trim: true },
  youtubeId: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
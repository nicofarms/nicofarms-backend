const mongoose = require("mongoose");
const Video = require("../models/videoModel");

// Supports watch?v=, youtu.be/, /embed/, /shorts/
const extractYoutubeId = (url) => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = u.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
        if (m) id = m[2];
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createVideo = async (req, res) => {
  try {
    const { title, youtubeUrl } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ success: false, message: "youtubeUrl is required" });
    }
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
    }
    const video = await Video.create({ title, youtubeUrl, youtubeId, createdBy: req.user.id });
    return res.status(201).json({ success: true, video });
  } catch (error) {
    console.error("Create Video Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, videos });
  } catch (error) {
    console.error("Get Videos Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });
    return res.status(200).json({ success: true, video });
  } catch (error) {
    console.error("Get Video Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const { title, youtubeUrl } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (youtubeUrl !== undefined) {
      const youtubeId = extractYoutubeId(youtubeUrl);
      if (!youtubeId) return res.status(400).json({ success: false, message: "Invalid YouTube URL" });
      updates.youtubeUrl = youtubeUrl;
      updates.youtubeId = youtubeId;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }
    const video = await Video.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });
    return res.status(200).json({ success: true, video });
  } catch (error) {
    console.error("Update Video Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
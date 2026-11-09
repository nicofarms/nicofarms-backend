const router = require("express").Router();
const auth = require("../middleware/auth");
const { requireAdmin } = auth;
const c = require("../controllers/videoController");

// Public: website displays videos
router.get("/", c.getVideos);
router.get("/:id", c.getVideoById);

// Admin only
router.post("/", auth, requireAdmin, c.createVideo);
router.put("/:id", auth, requireAdmin, c.updateVideo);

module.exports = router;
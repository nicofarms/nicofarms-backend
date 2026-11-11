const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/videoController");

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management and display endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Optional title for the video
 *         youtubeUrl:
 *           type: string
 *           description: Full original YouTube video URL
 *         youtubeId:
 *           type: string
 *           description: Extracted 11-character YouTube video ID
 *         createdBy:
 *           type: string
 *           description: Reference to the User ID who added the video
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "65f123456789abcdef012345"
 *         title: "Nicofarms Launch Video"
 *         youtubeUrl: "https://youtube.com"
 *         youtubeId: "dQw4w9WgXcQ"
 *         createdBy: "65f987654321fedcba654321"
 *         createdAt: "2026-11-11T03:35:00.000Z"
 *         updatedAt: "2026-11-11T03:35:00.000Z"
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Retrieve all videos
 *     description: Public endpoint to fetch all submitted videos sorted by newest creation date.
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 videos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new video entry (Admin only)
 *     description: Protected endpoint allowing authenticated admins to upload a video URL.
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - youtubeUrl
 *             properties:
 *               title:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *             example:
 *               title: "Nicofarms Operational Tour"
 *               youtubeUrl: "https://youtu.be"
 *     responses:
 *       201:
 *         description: Video metadata parsed and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 video:
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Missing fields or invalid YouTube link format
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       500:
 *         description: Server error
 */
router.get("/", c.getVideos);
router.post("/", auth, c.createVideo);

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Get a specific video by ID
 *     description: Public endpoint to view detailed metadata for an isolated video entry.
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB hex string ID of the video record
 *     responses:
 *       200:
 *         description: Video found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 video:
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid MongoDB Object ID syntax
 *       404:
 *         description: Video record not located
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an existing video's details (Admin only)
 *     description: Protected endpoint allowing authenticated admins to modify specific attributes.
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB hex string ID of the video record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *             example:
 *               title: "Updated Tour Title"
 *     responses:
 *       200:
 *         description: Record modified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 video:
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid syntax parameters, structural payload omission, or parsing errors
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       404:
 *         description: Target video record not located
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, c.updateVideo);
router.get("/:id", c.getVideoById);

module.exports = router;
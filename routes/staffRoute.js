const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaffById,
} = require("../controllers/staffController");

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management and display endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 65a1b2c3d4e5f6a7b8c9d0e1
 *         name:
 *           type: string
 *           description: Name of the staff member
 *           example: Jane Doe
 *         office:
 *           type: string
 *           description: Office or position of the staff member
 *           default: staff
 *           example: Farm Manager
 *         briefIntro:
 *           type: string
 *           description: A brief introduction of the staff member
 *           default: ""
 *           example: Experienced agricultural operations lead.
 *         detailedIntro:
 *           type: string
 *           description: A detailed introduction of the staff member
 *           default: ""
 *           example: Jane has over 10 years of experience managing sustainable crop and livestock farms.
 *         imageUrl:
 *           type: string
 *           description: URL of the staff member's image
 *           default: ""
 *           example: https://example.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the staff member was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the staff member was last updated
 */

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               office:
 *                 type: string
 *                 example: Farm Manager
 *               briefIntro:
 *                 type: string
 *                 example: Experienced agricultural operations lead.
 *               detailedIntro:
 *                 type: string
 *                 example: Jane has over 10 years of experience managing sustainable farms.
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com
 *     responses:
 *       201:
 *         description: Staff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff created successfully
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Name is required or staff with this name already exists
 *       500:
 *         description: Server error
 */
router.post("/", auth, createStaff);

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of all staff members sorted by newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 staff:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       500:
 *         description: Server error
 */
router.get("/", getAllStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Get a single staff member by ID
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the staff member
 *     responses:
 *       200:
 *         description: Staff member details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getStaffById);

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Update a staff member by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the staff member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               office:
 *                 type: string
 *               briefIntro:
 *                 type: string
 *               detailedIntro:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff updated successfully
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, updateStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   delete:
 *     summary: Delete a staff member by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the staff member
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff deleted successfully
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth, deleteStaffById);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  handleContactForm,
  getAllContacts,
  getContactById,
} = require("../controllers/contactController.js");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Website visitor contact messages
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send a public website contact message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Visitor
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               subject:
 *                 type: string
 *                 example: Farm produce enquiry
 *               message:
 *                 type: string
 *                 example: I would like to know more about your products.
 *     responses:
 *       201:
 *         description: Message saved and sent to configured email
 *       400:
 *         description: Required fields missing
 */
router.post("/", handleContactForm);

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact messages
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, getAllContacts);

/**
 * @swagger
 * /contact/{id}:
 *   get:
 *     summary: Get one contact message
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact id
 *     responses:
 *       200:
 *         description: Contact message found
 *       404:
 *         description: Contact not found
 */
router.get("/:id", auth, getContactById);

module.exports = router;

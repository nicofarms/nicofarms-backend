const router = require("express").Router();

const { adminLogin, verifyAccountCreatedOtp, createAdmin, deleteAdmin, verifyAdminLoginOtp} = require("../controllers/adminController");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The unique email of the user
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: The role assigned to the user
 *         otp:
 *           type: string
 *           nullable: true
 *           description: One-Time Password for verification
 *         otpExpiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: The expiration timestamp of the current OTP
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: The timestamp of the user's last login
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Flag showing if the account email has been verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 60d5ecb71f00002f48375624
 *         name: John Doe
 *         email: admin@nicofarms.com
 *         role: admin
 *         otp: null
 *         otpExpiresAt: null
 *         lastLoginAt: null
 *         isVerified: true
 *         createdAt: 2026-11-09T11:13:00.000Z
 *         updatedAt: 2026-11-09T11:13:00.000Z
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error description message
 *       example:
 *         message: Server error
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Email and OTP authentication for Admin accounts
 */

/**
 * @swagger
 * /admin/admins/create:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *             example:
 *               name: Admin User
 *               email: admin@nicofarms.com
 *               role: admin
 *     responses:
 *       201:
 *         description: User created and OTP sent to email successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: User created and OTP sent to email
 *       400:
 *         description: Bad Request - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: User already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/admins/create", createAdmin);

/**
 * @swagger
 * /admin/admins/verify-otp:
 *   post:
 *     summary: Verify OTP for account creation
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *             example:
 *               email: admin@nicofarms.com
 *               otp: "123456"
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *             example:
 *               message: User verified successfully
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error (Expired, Invalid, or Already Verified)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyVerified:
 *                 value: { "message": "User already verified" }
 *               expiredOtp:
 *                 value: { "message": "OTP has expired" }
 *               invalidOtp:
 *                 value: { "message": "Invalid OTP" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/admins/verify-otp", verifyAccountCreatedOtp);

/**
 * @swagger
 * /admin/admins/login:
 *   post:
 *     summary: Initiate Admin login by requesting an OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: admin@nicofarms.com
 *     responses:
 *       200:
 *         description: OTP generated and sent to email successfully for verified admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: OTP sent to email
 *       403:
 *         description: Admin account exists but is not verified yet. A new verification OTP was sent instead.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Admin account not verified. New verification OTP sent to email.
 *       404:
 *         description: Admin profile with specified email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Admin not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             example:
 *               message: Server error
 *               error: Cannot read properties of null (reading 'isVerified')
 */
router.post("/admins/login", adminLogin);

/**
 * @swagger
 * /admin/admins/login-otp:
 *   post:
 *     summary: Verify login OTP and issue access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *             example:
 *               email: admin@nicofarms.com
 *               otp: "654321"
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *             example:
 *               message: Admin logged in successfully
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               admin:
 *                 id: 60d5ecb71f00002f48375624
 *                 name: Admin User
 *                 email: admin@nicofarms.com
 *                 role: admin
 *       400:
 *         description: Validation error (Expired or Invalid OTP)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               expiredOtp:
 *                 value: { "message": "OTP has expired" }
 *               invalidOtp:
 *                 value: { "message": "Invalid OTP" }
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: Admin not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/admins/login-otp", verifyAdminLoginOtp);

/**
 * @swagger
 * /admin/admins/delete:
 *   post:
 *     summary: Delete an admin user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 */
router.post("/admins/delete", deleteAdmin);

module.exports = router;

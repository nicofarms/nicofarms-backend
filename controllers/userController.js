const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

const OTP_EXPIRY_MINUTES = 5;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const generateOTP = () => otpGenerator.generate(6, {
  upperCaseAlphabets: false,
  lowerCaseAlphabets: false,
  specialChars: false,
});

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  return process.env.JWT_SECRET;
};

const setUserOtp = (user) => {
  user.otp = generateOTP();
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

const sendOtpEmail = async (user, subject) => {
  await sendEmail({
    email: user.email,
    subject,
    text: `Your NicoFarms OTP is ${user.otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your NicoFarms OTP is <strong>${user.otp}</strong>.</p><p>It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  });
};

const issueToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  getJwtSecret(),
  { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
);

const verifyOtpValue = (user, otp) => {
  if (!user.otp || !user.otpExpiresAt) {
    return "OTP has not been requested";
  }

  if (user.otp !== String(otp || "").trim()) {
    return "Invalid OTP";
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    return "OTP has expired";
  }

  return null;
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email: normalizedEmail, role });
    setUserOtp(user);
    await user.save();
    await sendOtpEmail(user, "Verify your NicoFarms account");

    return res.status(201).json({
      success: true,
      message: "User created. OTP sent to email for verification.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyUserOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otpError = verifyOtpValue(user, otp);
    if (otpError) {
      return res.status(400).json({ success: false, message: otpError });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    user.lastLoginAt = new Date();
    await user.save();

    const token = issueToken(user);

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify User OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.requestLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Verify user before login" });
    }

    setUserOtp(user);
    await user.save();
    await sendOtpEmail(user, "Your NicoFarms login OTP");

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Request Login OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Verify user before login" });
    }

    const otpError = verifyOtpValue(user, otp);
    if (otpError) {
      return res.status(400).json({ success: false, message: otpError });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: issueToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Verify Login OTP Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

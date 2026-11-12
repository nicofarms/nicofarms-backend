const userModel = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
  return otpGenerator.generate(6, { 
    upperCaseAlphabets: false, 
    lowerCaseAlphabets: false, 
    specialChars: false 
  });
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, role} = req.body;
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;
    const newUser = new userModel({ name, email, role, otp, otpExpiresAt });
    
    await sendEmail({
      email,
      subject: "Nicofarms otp verification",
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });
    await newUser.save();
    res.status(201).json({ message: "User created and OTP sent to email" });
    } catch (error) {
      console.error("detailed create admin error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.verifyAccountCreatedOtp = async (req, res) => {
  try{
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified==true) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: "User verified successfully", token });

  }catch(error){
    res.status(500).json({ message: "Server error" });

  }
}

exports.deleteAdmin = async (req, res)=> {
  try{
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    await userModel.deleteOne({ email });
    res.status(200).json({ message: "Admin deleted successfully" });

  }catch(error){
    res.status(500).json({ message: "Server error" });
  }
}
exports.adminLogin = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await userModel.findOne({ email, role: "admin" });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    /* NOTE: If the admin is not verified, generate a new OTP, update expiration, save it, and send it */
    if (!admin.isVerified) {
      const verificationOtp = generateOTP();
      const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

      admin.otp = verificationOtp;
      admin.otpExpiresAt = otpExpiresAt;
      await admin.save();

      await sendEmail({
        email,
        subject: "Nicofarms otp verification",
        text: `Your OTP is ${verificationOtp}`,
        html: `<p>Your OTP is <strong>${verificationOtp}</strong></p>`,
      });
      
      return res.status(403).json({ message: "Admin account not verified. New verification OTP sent to email." });
    }

    // Normal flow for verified admins
    const emailOtp = generateOTP();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; 
    
    await sendEmail({
      email,
      subject: "Nicofarms Login Email",
      text: `Your OTP is ${emailOtp}`,
      html: `<p>Your OTP is <strong>${emailOtp}</strong></p>`,
    });

    admin.otp = emailOtp;
    admin.otpExpiresAt = otpExpiresAt;
    await admin.save();

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("detailed login error:", error); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.verifyAdminLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await userModel.findOne({ email, role: "admin" });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    if (admin.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (admin.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }


    admin.otp = null;
    admin.otpExpiresAt = null;
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Admin logged in successfully", token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });

  } catch(error) {
    console.error("detailed verify login error:", error); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllAdmins = async(req, res) => {
  try{
    const admins = await userModel.find({ role: "admin" }).select('-otp -otpExpiresAt -__v');
    res.status(200).json({ message: "Admins retrieved successfully", admins });

  }catch(error){
    console.error("detailed get all admins error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
const userModel = require('../models/userModel');
const sendMail = require('../utils/sendEmail');
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
    const otpExpires = Date.now() + 5 * 60 * 1000;
    const newUser = new userModel({ name, email, role, otp, otpExpires });
    await newUser.save();

    await sendMail({
      email,
      subject: "Nicofarms otp verification",
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP is <strong>${otp}</strong></p>`,
    });
    res.status(201).json({ message: "User created and OTP sent to email" });
    } catch (error) {
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

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
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
    };

    const emailOtp = generateOTP();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; 
    
    await sendMail({
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
    admin.otpExpires = null;
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: "Admin logged in successfully", token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });

  } catch(error) {
    console.error("detailed verify login error:", error); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
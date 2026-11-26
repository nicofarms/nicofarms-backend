const staffModel = require('../models/staffModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

exports.createStaff = async (req, res) => {
    try {
        const { name, office, briefIntro, detailedIntro } = req.body;
        const existingStaff = await staffModel.findOne({ name });
         if (existingStaff) {
            if (req.file) fs.unlinkSync(req.file.path); // Clean up temp file if duplicate
            return res.status(400).json({ message: "Staff with this name already exists" });
        }

        let imageUrl;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "staff",
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path); // Remove local temp file after Cloudinary upload
        }
        const newStaff = new staffModel({ name, office, briefIntro, detailedIntro, imageUrl });
        await newStaff.save();
        res.status(201).json({ message: "Staff created successfully", staff: newStaff });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error creating staff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await staffModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, staff: staffList });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await staffModel.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json({ success: true, staff });
    } catch (error) {
        console.error("Error fetching staff by ID:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { name, office, briefIntro, detailedIntro, imageUrl } = req.body;
        const staff = await staffModel.findById(req.params.id);
        if (!staff) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(404).json({ message: "Staff not found" });
        }
        if (name !== undefined) staff.name = name;
        if (office !== undefined) staff.office = office;
        if (briefIntro !== undefined) staff.briefIntro = briefIntro;
        if (detailedIntro !== undefined) staff.detailedIntro = detailedIntro;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "staff",
            });
            staff.imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path); 
        } else if (imageUrl !== undefined) {
            staff.imageUrl = imageUrl;
        }
        await staff.save();
        res.status(200).json({ message: "Staff updated successfully", staff });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error updating staff:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.deleteStaffById = async (req, res) => {
    try {
        const staff = await staffModel.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        await staffModel.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Staff deleted successfully" });
    } catch (error) {
        console.error('detailed error message', error.message)
        res.status(500).json({message: "internal server error"})
    }
}
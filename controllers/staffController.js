const staffModel = require('../models/staffModel');

exports.createStaff = async (req, res) => {
    try {
        const { name, office, briefIntro, detailedIntro, imageUrl } = req.body;
        const existingStaff = await staffModel.findOne({ name });
        if (existingStaff) {
            return res.status(400).json({ message: "Staff with this name already exists" });
        }
        const newStaff = new staffModel({ name, office, briefIntro, detailedIntro, imageUrl });
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        };
        await newStaff.save();
        res.status(201).json({ message: "Staff created successfully", staff: newStaff });
    } catch (error) {
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
            return res.status(404).json({ message: "Staff not found" });
        }
        if (name !== undefined) staff.name = name;
        if (office !== undefined) staff.office = office;
        if (briefIntro !== undefined) staff.briefIntro = briefIntro;
        if (detailedIntro !== undefined) staff.detailedIntro = detailedIntro;
        if (imageUrl !== undefined) staff.imageUrl = imageUrl;
        await staff.save();
        res.status(200).json({ message: "Staff updated successfully", staff });
    } catch (error) {
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
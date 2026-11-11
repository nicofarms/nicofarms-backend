const contactModel = require("../models/contact.js");
const { sendEmail } = require("../utils/sendEmail.js");

exports.handleContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    const newContact = new contactModel({ name, email, phone, subject, message });
    await newContact.save();

    await sendEmail({
      email: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: subject || `New Contact Form Submission from ${name}`,
      message: `You received a message from ${name } ${email} ${phone }: \n\n${message}`,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Contact Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await contactModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Get Contacts Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await contactModel.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get Contact Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

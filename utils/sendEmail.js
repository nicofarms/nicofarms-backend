const sendEmail = async ({ email, subject, message, text, html }) => {
  const webhookUrl = process.env.GMAIL_WEBHOOK_URL;
  const secret = process.env.GMAIL_WEBHOOK_SECRET;
  console.log("DEBUG secret:", JSON.stringify(secret));
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      to: email,
      subject,
      text: text || message,
      html,
    }),
  });

  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error || "Failed to send email via Apps Script");
  }

  return result;
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;



// const sendEmail = async ({ email, subject, message, text, html }) => {
//   const apiKey = process.env.BREVO_API_KEY;
//   const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || process.env.user;

//   if (!apiKey || !senderEmail) {
//     throw new Error("Missing BREVO_API_KEY or BREVO_SENDER_EMAIL in environment variables");
//   }

//   const response = await fetch("https://brevo.com", {
//     method: "POST",
//     headers: {
//       accept: "application/json",
//       "api-key": apiKey,
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       sender: { name: "Nicofarms", email: senderEmail },
//       to: [{ email }],
//       subject,
//       textContent: text || message,
//       htmlContent: html,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.text();
//     throw new Error(`Brevo API error (${response.status}): ${errorData}`);
//   }

//   return response.json();
// };

// module.exports = sendEmail;
// module.exports.sendEmail = sendEmail;





// const nodemailer = require("nodemailer");

// const sendEmail = async ({ email, subject, message, text, html }) => {
//   const mailUser = process.env.EMAIL_USER || process.env.user;
//   const mailPass = process.env.EMAIL_PASS || process.env.pass;

//   if (!mailUser || !mailPass) {
//     throw new Error("Missing email credentials in environment variables");
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: mailUser,
//       pass: mailPass,
//     },
//   });

//   const mailOptions = {
//     from: mailUser,
//     to: email,
//     subject,
//     text: text || message,
//     html,
//   };

//   return transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
// module.exports.sendEmail = sendEmail;


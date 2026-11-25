const sendEmail = async ({ email, subject, message, text, html }) => {
  const webhookUrl = process.env.GMAIL_WEBHOOK_URL;
  const secret = process.env.GMAIL_WEBHOOK_SECRET;
  console.log("Sending email to:", email);
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
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPriceAlertEmail = async (email, name, targetPrice, currentPrice, direction) => {
  await transporter.sendMail({
    from: `"Kuberi Gold" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🔔 Gold Price Alert Triggered — ₹${currentPrice}/g`,
    html: `
      <h2 style="color:#B8860B;">Kuberi Gold — Price Alert</h2>
      <p>Hi ${name},</p>
      <p>Your gold price alert has been triggered!</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee;color:#777">Alert Type</td><td style="padding:8px;border:1px solid #eee">Gold price went <strong>${direction.toLowerCase()}</strong> your target</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;color:#777">Target Price</td><td style="padding:8px;border:1px solid #eee">₹${targetPrice}/g</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;color:#777">Current Price</td><td style="padding:8px;border:1px solid #eee"><strong>₹${currentPrice}/g</strong></td></tr>
      </table>
      <p style="margin-top:16px">Now might be a great time to <a href="${process.env.APP_URL || '#'}">invest in digital gold</a>.</p>
      <p style="color:#999;font-size:12px">— Kuberi Gold Team</p>
    `,
  });
};

const sendSIPExecutionEmail = async (email, name, amountInINR, goldInGrams, pricePerGram) => {
  await transporter.sendMail({
    from: `"Kuberi Gold" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `✅ Your SIP of ₹${amountInINR} executed successfully`,
    html: `
      <h2 style="color:#B8860B;">Kuberi Gold — SIP Executed</h2>
      <p>Hi ${name},</p>
      <p>Your scheduled gold investment (SIP) was executed successfully.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #eee;color:#777">Amount Invested</td><td style="padding:8px;border:1px solid #eee">₹${amountInINR}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;color:#777">Gold Purchased</td><td style="padding:8px;border:1px solid #eee">${goldInGrams} grams</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;color:#777">Price per gram</td><td style="padding:8px;border:1px solid #eee">₹${pricePerGram}</td></tr>
      </table>
      <p style="color:#999;font-size:12px">— Kuberi Gold Team</p>
    `,
  });
};

module.exports = { sendPriceAlertEmail, sendSIPExecutionEmail };

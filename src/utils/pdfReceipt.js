const PDFDocument = require("pdfkit");

/**
 * Generate a gold transaction receipt PDF as a buffer.
 */
const generateReceipt = (txData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(22).fillColor("#B8860B").text("Kuberi Gold", { align: "center" });
    doc.fontSize(12).fillColor("#555").text("Digital Gold Investment Platform", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#B8860B").lineWidth(1).stroke();
    doc.moveDown();

    // Title
    const title = txData.type === "SELL" ? "Gold Sale Certificate" : "Gold Purchase Certificate";
    doc.fontSize(16).fillColor("#333").text(title, { align: "center" });
    doc.moveDown();

    // Transaction details table
    const rows = [
      ["Transaction ID", `#${txData.transactionId}`],
      ["Date & Time", new Date(txData.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
      ["Type", txData.type],
      ["Amount (INR)", `₹ ${txData.amountInINR.toFixed(2)}`],
      ["Gold (grams)", `${txData.goldInGrams} g`],
      ["Price per gram", `₹ ${txData.pricePerGram.toFixed(2)}`],
      ["Status", "COMPLETED"],
    ];

    rows.forEach(([label, value]) => {
      doc.fontSize(11).fillColor("#777").text(label, 80, doc.y, { continued: true, width: 200 });
      doc.fillColor("#222").text(value, { align: "left" });
      doc.moveDown(0.4);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ddd").lineWidth(0.5).stroke();
    doc.moveDown();

    doc.fontSize(10).fillColor("#999").text(
      "This is a computer-generated certificate and does not require a signature.\nKuberi Gold is a digital gold investment service.",
      { align: "center" }
    );

    doc.end();
  });
};

module.exports = { generateReceipt };

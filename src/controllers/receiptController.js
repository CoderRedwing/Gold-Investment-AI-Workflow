const prisma = require("../lib/prisma");
const { generateReceipt } = require("../utils/pdfReceipt");

const downloadReceipt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const txId = parseInt(req.params.txId);

    const tx = await prisma.goldTransaction.findFirst({ where: { id: txId, userId } });
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });

    const pdf = await generateReceipt({
      transactionId: tx.id,
      type: tx.type,
      amountInINR: tx.amountInINR,
      goldInGrams: tx.goldInGrams,
      pricePerGram: tx.pricePerGram,
      createdAt: tx.createdAt,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kuberi-receipt-${tx.id}.pdf"`,
      "Content-Length": pdf.length,
    });
    return res.send(pdf);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { downloadReceipt };

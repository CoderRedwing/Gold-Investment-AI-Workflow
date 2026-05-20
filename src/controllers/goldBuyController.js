const { purchaseGold } = require("../services/goldBuyService");

const buyGold = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amountInINR } = req.body;

    if (!amountInINR) return res.status(400).json({ success: false, message: "amountInINR is required" });
    if (amountInINR < 10) return res.status(400).json({ success: false, message: "Minimum investment is ₹10" });

    const result = await purchaseGold(userId, amountInINR);
    return res.json(result);
  } catch (err) {
    console.error("BuyGold Error:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

module.exports = { buyGold };

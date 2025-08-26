const { purchaseGold } = require("../services/goldBuyService");

const buyGold = async (req, res) => {
  try {
    const { userId, amountInINR } = req.body;

    if (!userId || !amountInINR) {
      return res.status(400).json({ success: false, message: "Missing userId or amountInINR" });
    }

    if (amountInINR < 1) {
      return res.status(400).json({ success: false, message: "Minimum investment is ₹1" });
    }

    const result = await purchaseGold(userId, amountInINR);
    return res.json(result);

  } catch (error) {
    console.error("BuyGold Error:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

module.exports = { buyGold };

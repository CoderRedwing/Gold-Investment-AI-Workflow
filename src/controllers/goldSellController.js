const { sellGold } = require("../services/goldSellService");

const sellGoldController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goldInGrams } = req.body;

    if (!goldInGrams || goldInGrams <= 0)
      return res.status(400).json({ success: false, message: "goldInGrams must be a positive number" });
    if (goldInGrams < 0.01)
      return res.status(400).json({ success: false, message: "Minimum sell quantity is 0.01 grams" });

    const result = await sellGold(userId, goldInGrams);
    return res.json(result);
  } catch (err) {
    console.error("SellGold Error:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { sellGoldController };

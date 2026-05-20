const { getCurrentPrice, getPriceHistory } = require("../services/priceService");

const livePrice = async (req, res) => {
  try {
    return res.json(await getCurrentPrice());
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const priceHistory = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    return res.json(await getPriceHistory(days));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { livePrice, priceHistory };

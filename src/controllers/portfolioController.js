const { getPortfolio } = require("../services/portfolioService");

const portfolioController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getPortfolio(userId);
    return res.json(result);
  } catch (err) {
    console.error("Portfolio Error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { portfolioController };

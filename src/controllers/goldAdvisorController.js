const goldAdvisorService = require('../services/goldAdvisorService');

const goldAdvisorController = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const answer = await goldAdvisorService(question);

    res.json({ success: true, answer });
  } catch (error) {
    console.error("Gold Advisor Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch AI response" });
  }
};


module.exports = goldAdvisorController;

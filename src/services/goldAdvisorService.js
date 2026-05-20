const getGeminiResponse = require("../kuber/kuberClient");
const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");

// 1. Added 'onChunk' as a parameter here
const goldAdvisorService = async (question, userId = null, onChunk) => {
  let portfolio = null;

  if (userId) {
    try {
      const wallet = await prisma.goldWallet.findUnique({ where: { userId } });
      if (wallet) {
        const currentPrice = await fetchGoldPrice();
        const currentValue = parseFloat((wallet.totalGrams * currentPrice).toFixed(2));
        const pnl = parseFloat((currentValue - wallet.totalInvested).toFixed(2));
        const pnlPercent = wallet.totalInvested > 0
          ? parseFloat(((pnl / wallet.totalInvested) * 100).toFixed(2))
          : 0;
        portfolio = {
          totalGrams: wallet.totalGrams,
          totalInvested: wallet.totalInvested,
          currentValue,
          currentPricePerGram: currentPrice,
          pnl,
          pnlPercent,
        };
      }
    } catch (_) {
      // Portfolio context is optional — don't fail the request
    }
  }

  // 2. Pass 'portfolio' context and the 'onChunk' callback directly down to Gemini client
  return await getGeminiResponse(question, portfolio, onChunk);
};

module.exports = goldAdvisorService;
const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");

const getPortfolio = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) throw new Error("User not found");

  const currentPrice = await fetchGoldPrice();
  const wallet = user.wallet || { totalGrams: 0, totalInvested: 0 };
  const currentValue = parseFloat((wallet.totalGrams * currentPrice).toFixed(2));
  const pnl = parseFloat((currentValue - wallet.totalInvested).toFixed(2));
  const pnlPercent = wallet.totalInvested > 0
    ? parseFloat(((pnl / wallet.totalInvested) * 100).toFixed(2))
    : 0;

  return {
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      wallet: {
        totalGrams: wallet.totalGrams,
        totalInvested: wallet.totalInvested,
        currentValue,
        currentPricePerGram: currentPrice,
        pnl,
        pnlPercent,
      },
      transactions: user.transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amountInINR: tx.amountInINR,
        goldInGrams: tx.goldInGrams,
        pricePerGram: tx.pricePerGram,
        status: tx.status,
        createdAt: tx.createdAt,
      })),
    },
  };
};

module.exports = { getPortfolio };

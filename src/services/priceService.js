const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");

const getCurrentPrice = async () => {
  const price = await fetchGoldPrice();
  return { success: true, data: { pricePerGram: price, currency: "INR", updatedAt: new Date() } };
};

const getPriceHistory = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snapshots = await prisma.priceSnapshot.findMany({
    where: { recordedAt: { gte: since } },
    orderBy: { recordedAt: "asc" },
    select: { pricePerGram: true, recordedAt: true },
  });

  return {
    success: true,
    data: {
      days,
      count: snapshots.length,
      snapshots,
      high: snapshots.length ? Math.max(...snapshots.map((s) => s.pricePerGram)) : null,
      low: snapshots.length ? Math.min(...snapshots.map((s) => s.pricePerGram)) : null,
    },
  };
};

module.exports = { getCurrentPrice, getPriceHistory };

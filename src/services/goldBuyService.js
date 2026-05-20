const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");
const { dispatchWebhook } = require("../utils/webhook");

const purchaseGold = async (userId, amountInINR) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const pricePerGram = await fetchGoldPrice();
  const goldInGrams = parseFloat((amountInINR / pricePerGram).toFixed(4));

  const [transaction] = await prisma.$transaction([
    prisma.goldTransaction.create({
      data: { userId, type: "BUY", amountInINR, goldInGrams, pricePerGram },
    }),
    prisma.goldWallet.upsert({
      where: { userId },
      update: {
        totalGrams: { increment: goldInGrams },
        totalInvested: { increment: amountInINR },
      },
      create: { userId, totalGrams: goldInGrams, totalInvested: amountInINR },
    }),
  ]);

  const payload = {
    transactionId: transaction.id,
    goldInGrams,
    amountSpent: amountInINR,
    pricePerGram,
    createdAt: transaction.createdAt,
  };

  dispatchWebhook(userId, "gold.purchased", payload);

  return { success: true, message: "Gold purchased successfully", data: payload };
};

module.exports = { purchaseGold };

const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");
const { dispatchWebhook } = require("../utils/webhook");

const sellGold = async (userId, goldInGrams) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
  if (!user) throw new Error("User not found");
  if (!user.wallet || user.wallet.totalGrams < goldInGrams)
    throw new Error(`Insufficient gold. You have ${user.wallet?.totalGrams || 0}g available.`);

  const pricePerGram = await fetchGoldPrice();
  const amountInINR = parseFloat((goldInGrams * pricePerGram).toFixed(2));

  const [transaction] = await prisma.$transaction([
    prisma.goldTransaction.create({
      data: { userId, type: "SELL", amountInINR, goldInGrams, pricePerGram },
    }),
    prisma.goldWallet.update({
      where: { userId },
      data: {
        totalGrams: { decrement: goldInGrams },
      },
    }),
  ]);

  const payload = { transactionId: transaction.id, goldSoldGrams: goldInGrams, amountReceived: amountInINR, pricePerGram, createdAt: transaction.createdAt };
  dispatchWebhook(userId, "gold.sold", payload);

  return { success: true, message: "Gold sold successfully", data: payload };
};

module.exports = { sellGold };

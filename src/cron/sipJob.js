const cron = require("node-cron");
const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");
const { sendSIPExecutionEmail } = require("../utils/mailer");
const { computeNextRun } = require("../services/sipService");
const { dispatchWebhook } = require("../utils/webhook");

const executeDueSIPs = async () => {
  try {
    const now = new Date();
    const duePlans = await prisma.sIPPlan.findMany({
      where: { isActive: true, nextRunAt: { lte: now } },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!duePlans.length) return;

    const pricePerGram = await fetchGoldPrice();

    for (const plan of duePlans) {
      let status = "COMPLETED";
      let errorMessage = null;
      let transactionId = null;

      try {
        const goldInGrams = parseFloat((plan.amountInINR / pricePerGram).toFixed(4));

        const [transaction] = await prisma.$transaction([
          prisma.goldTransaction.create({
            data: {
              userId: plan.userId,
              type: "BUY",
              amountInINR: plan.amountInINR,
              goldInGrams,
              pricePerGram,
              notes: `SIP auto-execution #${plan.id}`,
            },
          }),
          prisma.goldWallet.upsert({
            where: { userId: plan.userId },
            update: {
              totalGrams: { increment: goldInGrams },
              totalInvested: { increment: plan.amountInINR },
            },
            create: {
              userId: plan.userId,
              totalGrams: goldInGrams,
              totalInvested: plan.amountInINR,
            },
          }),
        ]);

        transactionId = transaction.id;

        // Send email
        if (plan.user?.email) {
          sendSIPExecutionEmail(plan.user.email, plan.user.name, plan.amountInINR, goldInGrams, pricePerGram)
            .catch((e) => console.error("[CRON] SIP email failed:", e.message));
        }

        // Fire webhook
        dispatchWebhook(plan.userId, "sip.executed", { sipPlanId: plan.id, transactionId, goldInGrams, amountInINR: plan.amountInINR, pricePerGram });

        console.log(`[CRON] SIP #${plan.id} executed — ₹${plan.amountInINR} → ${goldInGrams}g`);
      } catch (err) {
        status = "FAILED";
        errorMessage = err.message;
        console.error(`[CRON] SIP #${plan.id} failed:`, err.message);
      }

      const nextRunAt = computeNextRun(plan.frequency, plan.dayOfWeek, plan.dayOfMonth);
      await prisma.$transaction([
        prisma.sIPExecution.create({ data: { sipPlanId: plan.id, transactionId, status, errorMessage } }),
        prisma.sIPPlan.update({ where: { id: plan.id }, data: { lastRunAt: now, nextRunAt } }),
      ]);
    }
  } catch (err) {
    console.error("[CRON] SIP executor error:", err.message);
  }
};

const startSIPJob = () => {
  cron.schedule("*/5 * * * *", executeDueSIPs);
  console.log("[CRON] SIP execution job started (every 5 mins)");
};

module.exports = { startSIPJob };

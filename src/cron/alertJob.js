const cron = require("node-cron");
const prisma = require("../lib/prisma");
const { fetchGoldPrice } = require("../utils/goldPrice");
const { sendPriceAlertEmail } = require("../utils/mailer");

const checkAlerts = async () => {
  try {
    const currentPrice = await fetchGoldPrice();
    const activeAlerts = await prisma.priceAlert.findMany({
      where: { triggered: false },
      include: { user: { select: { email: true, name: true } } },
    });

    for (const alert of activeAlerts) {
      const triggered =
        (alert.direction === "ABOVE" && currentPrice >= alert.targetPrice) ||
        (alert.direction === "BELOW" && currentPrice <= alert.targetPrice);

      if (triggered) {
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { triggered: true, triggeredAt: new Date() },
        });

        if (alert.notifyVia === "email" && alert.user?.email) {
          sendPriceAlertEmail(
            alert.user.email,
            alert.user.name,
            alert.targetPrice,
            currentPrice,
            alert.direction
          ).catch((e) => console.error("[CRON] Alert email failed:", e.message));
        }

        console.log(`[CRON] Alert #${alert.id} triggered at ₹${currentPrice}/g`);
      }
    }
  } catch (err) {
    console.error("[CRON] Alert check failed:", err.message);
  }
};

const startAlertJob = () => {
  cron.schedule("*/30 * * * *", checkAlerts);
  console.log("[CRON] Price alert job started (every 30 mins)");
};

module.exports = { startAlertJob };

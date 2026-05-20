const cron = require("node-cron");
const { fetchAndSnapshotPrice } = require("../utils/goldPrice");

const startPriceSnapshotJob = () => {
  // Every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      const price = await fetchAndSnapshotPrice();
      console.log(`[CRON] Price snapshot saved: ₹${price}/g`);
    } catch (err) {
      console.error("[CRON] Price snapshot failed:", err.message);
    }
  });
  console.log("[CRON] Price snapshot job started (every hour)");
};

module.exports = { startPriceSnapshotJob };

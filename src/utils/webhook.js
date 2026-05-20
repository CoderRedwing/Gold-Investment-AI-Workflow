const axios = require("axios");
const crypto = require("crypto");
const prisma = require("../lib/prisma");

/**
 * Fire webhooks for a given event and userId.
 */
const dispatchWebhook = async (userId, event, payload) => {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId, isActive: true, events: { has: event } },
    });

    for (const wh of webhooks) {
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = crypto.createHmac("sha256", wh.secret).update(body).digest("hex");

      axios
        .post(wh.url, body, {
          headers: {
            "Content-Type": "application/json",
            "X-Kuberi-Signature": `sha256=${signature}`,
            "X-Kuberi-Event": event,
          },
          timeout: 5000,
        })
        .catch((err) => console.error(`Webhook failed for ${wh.url}:`, err.message));
    }
  } catch (err) {
    console.error("dispatchWebhook error:", err.message);
  }
};

module.exports = { dispatchWebhook };

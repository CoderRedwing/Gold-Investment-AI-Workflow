const prisma = require("../lib/prisma");
const crypto = require("crypto");

const VALID_EVENTS = ["gold.purchased", "gold.sold", "sip.executed", "alert.triggered"];

const createWebhook = async (userId, url, events) => {
  if (!events || !events.length) throw new Error("At least one event required");
  const invalid = events.filter((e) => !VALID_EVENTS.includes(e));
  if (invalid.length) throw new Error(`Invalid events: ${invalid.join(", ")}. Valid: ${VALID_EVENTS.join(", ")}`);

  const secret = crypto.randomBytes(24).toString("hex");
  const wh = await prisma.webhook.create({ data: { userId, url, secret, events } });
  return { success: true, data: { ...wh, secret } };
};

const listWebhooks = async (userId) => {
  const whs = await prisma.webhook.findMany({ where: { userId } });
  return { success: true, data: whs.map((w) => ({ ...w, secret: "***hidden***" })) };
};

const deleteWebhook = async (userId, whId) => {
  const wh = await prisma.webhook.findFirst({ where: { id: whId, userId } });
  if (!wh) throw new Error("Webhook not found");
  await prisma.webhook.delete({ where: { id: whId } });
  return { success: true, message: "Webhook deleted" };
};

module.exports = { createWebhook, listWebhooks, deleteWebhook, VALID_EVENTS };

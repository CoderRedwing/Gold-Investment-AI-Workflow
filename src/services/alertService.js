const prisma = require("../lib/prisma");

const createAlert = async (userId, targetPrice, direction, notifyVia = "email") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const alert = await prisma.priceAlert.create({
    data: { userId, targetPrice, direction, notifyVia },
  });

  return { success: true, message: "Price alert created", data: alert };
};

const getUserAlerts = async (userId) => {
  const alerts = await prisma.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return { success: true, data: alerts };
};

const deleteAlert = async (userId, alertId) => {
  const alert = await prisma.priceAlert.findFirst({ where: { id: alertId, userId } });
  if (!alert) throw new Error("Alert not found");
  await prisma.priceAlert.delete({ where: { id: alertId } });
  return { success: true, message: "Alert deleted" };
};

module.exports = { createAlert, getUserAlerts, deleteAlert };

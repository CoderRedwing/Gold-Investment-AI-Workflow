const prisma = require("../lib/prisma");

const computeNextRun = (frequency, dayOfWeek, dayOfMonth) => {
  const now = new Date();
  const next = new Date(now);

  if (frequency === "DAILY") {
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
  } else if (frequency === "WEEKLY") {
    const target = dayOfWeek ?? 1; // Monday default
    const diff = (target - now.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + diff);
    next.setHours(9, 0, 0, 0);
  } else if (frequency === "MONTHLY") {
    const target = dayOfMonth ?? 1;
    next.setMonth(next.getMonth() + 1);
    next.setDate(target);
    next.setHours(9, 0, 0, 0);
  }
  return next;
};

const createSIP = async (userId, amountInINR, frequency, dayOfWeek, dayOfMonth) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (amountInINR < 100) throw new Error("Minimum SIP amount is ₹100");

  const nextRunAt = computeNextRun(frequency, dayOfWeek, dayOfMonth);
  const plan = await prisma.sIPPlan.create({
    data: { userId, amountInINR, frequency, dayOfWeek, dayOfMonth, nextRunAt },
  });

  return { success: true, message: "SIP plan created", data: { ...plan, nextRunAt } };
};

const getUserSIPs = async (userId) => {
  const plans = await prisma.sIPPlan.findMany({
    where: { userId },
    include: { executions: { orderBy: { executedAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });
  return { success: true, data: plans };
};

const toggleSIP = async (userId, sipId, isActive) => {
  const plan = await prisma.sIPPlan.findFirst({ where: { id: sipId, userId } });
  if (!plan) throw new Error("SIP plan not found");
  const updated = await prisma.sIPPlan.update({ where: { id: sipId }, data: { isActive } });
  return { success: true, message: `SIP ${isActive ? "activated" : "paused"}`, data: updated };
};

const deleteSIP = async (userId, sipId) => {
  const plan = await prisma.sIPPlan.findFirst({ where: { id: sipId, userId } });
  if (!plan) throw new Error("SIP plan not found");
  await prisma.sIPPlan.delete({ where: { id: sipId } });
  return { success: true, message: "SIP plan deleted" };
};

module.exports = { createSIP, getUserSIPs, toggleSIP, deleteSIP, computeNextRun };

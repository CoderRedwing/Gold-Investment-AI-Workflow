const { createSIP, getUserSIPs, toggleSIP, deleteSIP } = require("../services/sipService");

const create = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amountInINR, frequency, dayOfWeek, dayOfMonth } = req.body;
    if (!amountInINR || !frequency)
      return res.status(400).json({ success: false, message: "amountInINR and frequency required" });
    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency))
      return res.status(400).json({ success: false, message: "frequency must be DAILY, WEEKLY, or MONTHLY" });
    return res.status(201).json(await createSIP(userId, amountInINR, frequency, dayOfWeek, dayOfMonth));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const list = async (req, res) => {
  try {
    return res.json(await getUserSIPs(req.user.userId));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggle = async (req, res) => {
  try {
    const { isActive } = req.body;
    return res.json(await toggleSIP(req.user.userId, parseInt(req.params.id), isActive));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    return res.json(await deleteSIP(req.user.userId, parseInt(req.params.id)));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { create, list, toggle, remove };

const { createAlert, getUserAlerts, deleteAlert } = require("../services/alertService");

const create = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetPrice, direction, notifyVia } = req.body;
    if (!targetPrice || !direction)
      return res.status(400).json({ success: false, message: "targetPrice and direction (ABOVE|BELOW) required" });
    if (!["ABOVE", "BELOW"].includes(direction))
      return res.status(400).json({ success: false, message: "direction must be ABOVE or BELOW" });
    return res.status(201).json(await createAlert(userId, targetPrice, direction, notifyVia));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const list = async (req, res) => {
  try {
    return res.json(await getUserAlerts(req.user.userId));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    return res.json(await deleteAlert(req.user.userId, parseInt(req.params.id)));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { create, list, remove };

const { createWebhook, listWebhooks, deleteWebhook, VALID_EVENTS } = require("../services/webhookService");

const create = async (req, res) => {
  try {
    const { url, events } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "url required" });
    return res.status(201).json(await createWebhook(req.user.userId, url, events));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const list = async (req, res) => {
  try {
    return res.json(await listWebhooks(req.user.userId));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    return res.json(await deleteWebhook(req.user.userId, parseInt(req.params.id)));
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const getEvents = async (req, res) => res.json({ success: true, data: VALID_EVENTS });

module.exports = { create, list, remove, getEvents };

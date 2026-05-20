const express = require("express");
const { create, list, remove, getEvents } = require("../controllers/webhookController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);
router.get("/events", getEvents);
router.post("/", create);
router.get("/", list);
router.delete("/:id", remove);
module.exports = router;

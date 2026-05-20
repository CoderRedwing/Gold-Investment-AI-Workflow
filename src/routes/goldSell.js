const express = require("express");
const { sellGoldController } = require("../controllers/goldSellController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.post("/", authMiddleware, sellGoldController);
module.exports = router;

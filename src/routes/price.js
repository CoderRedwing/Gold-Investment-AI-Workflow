const express = require("express");
const { livePrice, priceHistory } = require("../controllers/priceController");

const router = express.Router();
router.get("/live", livePrice);
router.get("/history", priceHistory);
module.exports = router;

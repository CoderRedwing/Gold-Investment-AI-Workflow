const express = require("express");
const { buyGold } = require("../controllers/goldBuyController");

const router = express.Router();

router.post("/", buyGold);

module.exports = router;

const express = require("express");
const { downloadReceipt } = require("../controllers/receiptController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.get("/:txId", authMiddleware, downloadReceipt);
module.exports = router;

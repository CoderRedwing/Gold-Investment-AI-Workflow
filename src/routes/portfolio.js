const express = require("express");
const { portfolioController } = require("../controllers/portfolioController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.get("/", authMiddleware, portfolioController);
module.exports = router;

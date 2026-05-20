const express = require("express");
const goldAdvisorController = require("../controllers/goldAdvisorController");
const { advisorLimiter } = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Auth is optional — works anonymously too, but with portfolio context when logged in
router.post("/", advisorLimiter, (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) return authMiddleware(req, res, next);
  next();
}, goldAdvisorController);

module.exports = router;
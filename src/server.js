require("dotenv").config();
const express = require("express");
const { generalLimiter } = require("./middleware/rateLimiter");

// Routes
const authRoutes = require("./routes/auth");
const goldAdvisorRoutes = require("./routes/goldAdvisor");
const goldBuyRoutes = require("./routes/goldBuy");
const goldSellRoutes = require("./routes/goldSell");
const portfolioRoutes = require("./routes/portfolio");
const priceRoutes = require("./routes/price");
const alertRoutes = require("./routes/alerts");
const sipRoutes = require("./routes/sip");
const webhookRoutes = require("./routes/webhooks");
const receiptRoutes = require("./routes/receipts");

// Cron jobs
const { startPriceSnapshotJob } = require("./cron/priceSnapshotJob");
const { startAlertJob } = require("./cron/alertJob");
const { startSIPJob } = require("./cron/sipJob");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(generalLimiter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Kuberi Gold API is running 🚀",
    version: "2.0.0",
    endpoints: {
      auth: ["/api/auth/register", "/api/auth/login"],
      advisor: "/api/gold-advisor (POST)",
      trade: ["/api/gold-purchase (POST)", "/api/gold-sell (POST)"],
      portfolio: "/api/portfolio (GET)",
      price: ["/api/price/live (GET)", "/api/price/history?days=30 (GET)"],
      alerts: "/api/alerts (GET|POST|DELETE)",
      sip: "/api/sip (GET|POST|PATCH|DELETE)",
      webhooks: "/api/webhooks (GET|POST|DELETE)",
      receipts: "/api/receipts/:txId (GET)",
    },
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/gold-advisor", goldAdvisorRoutes);
app.use("/api/gold-purchase", goldBuyRoutes);
app.use("/api/gold-sell", goldSellRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/price", priceRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/sip", sipRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/receipts", receiptRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start cron jobs
startPriceSnapshotJob();
startAlertJob();
startSIPJob();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Kuberi Gold API v2.0 running on http://localhost:${PORT}`);
});

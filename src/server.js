require("dotenv").config();
const express = require("express");

const goldAdvisorRoutes = require("./routes/goldAdvisor");
const goldInvestmentRoutes = require("./routes/goldBuy"); 

const app = express();
app.use(express.json());


app.use("/api/gold-advisor", goldAdvisorRoutes);
app.use("/api/gold-purchase", goldInvestmentRoutes); 

app.get("/", (req, res) => {
  res.json({ success: true, message: "Gold Investment API is running 🚀" });
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

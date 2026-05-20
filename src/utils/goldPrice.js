const axios = require("axios");
const prisma = require("../lib/prisma");

const fetchGoldPrice = async () => {
  try {
    const response = await axios.get("https://api.metalpriceapi.com/v1/latest", {
      params: {
        api_key: process.env.METALS_API_KEY,
        base: "INR",
        currencies: "XAU,XAG,EUR",
      },
    });

    const rates = response.data.rates;

    let pricePerOunceINR;
    if (rates["INRXAU"]) {
      pricePerOunceINR = rates["INRXAU"];
    } else if (rates["XAU"]) {
      pricePerOunceINR = 1 / rates["XAU"];
    } else {
      throw new Error("Gold rate not found in API response");
    }

    const pricePerGram = parseFloat((pricePerOunceINR / 31.1035).toFixed(2));
    return pricePerGram;
  } catch (error) {
    console.error("Error fetching gold price:", error.response?.data || error.message);
    throw new Error("Unable to fetch gold price");
  }
};

/**
 * Fetch price and save a snapshot to DB for historical tracking.
 */
const fetchAndSnapshotPrice = async () => {
  const pricePerGram = await fetchGoldPrice();
  await prisma.priceSnapshot.create({ data: { pricePerGram } });
  return pricePerGram;
};

module.exports = { fetchGoldPrice, fetchAndSnapshotPrice };

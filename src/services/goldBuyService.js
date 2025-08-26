const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fetchGoldPrice = async () => {
  try {
    const response = await axios.get("https://api.metalpriceapi.com/v1/latest", {
      params: {
        api_key: process.env.METALS_API_KEY,
        base: "INR",               
        currencies: "XAU,XAG,EUR"
      }
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

    const pricePerGram = pricePerOunceINR / 31.1035;

    return pricePerGram;
  } catch (error) {
    console.error("Error fetching gold price:", error.response?.data || error.message);
    throw new Error("Unable to fetch gold price");
  }
};

const purchaseGold = async (userId, amountInINR) => {
  try {
    const pricePerGram = await fetchGoldPrice();
    const goldInGrams = +(amountInINR / pricePerGram).toFixed(4); 
    const transaction = await prisma.goldTransaction.create({
      data: {
        userId,
        amountInINR,
        goldInGrams,
        pricePerGram
      }
    });

    return {
      success: true,
      message: "Gold purchased successfully",
      data: {
        transactionId: transaction.id,
        goldInGrams,
        amountSpent: amountInINR,
        pricePerGram,
        createdAt: transaction.createdAt
      }
    };
  } catch (error) {
    console.error("BuyGold Error:", error.message);
    return {
      success: false,
      message: "Unable to purchase gold",
      error: error.message
    };
  }
};

module.exports = { purchaseGold };

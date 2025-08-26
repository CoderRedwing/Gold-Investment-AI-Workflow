require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiResponse = async (question) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
The user asked: "${question}".

### Response Rules:

1. If the question is about **gold, gold investment, prices, safety, returns, or similar topics**:
   - Reply in a **structured financial advisor style**:
     **1. Top Gold Investment Options** (Digital Gold, Sovereign Gold Bonds, ETFs, Physical Gold) → each with short pros/cons.
     **2. Pro Tip for Beginners** → practical and simple.
     **3. Suggested Investment Strategy** → % allocation and diversification.
     **4. Call-to-Action** → invite to explore digital gold via our app.
   - Tone: expert, clear, professional but approachable.

2. If the question is **NOT about gold**:
   - Step 1: Provide a **direct, concise, and accurate answer** to the user’s actual question.  
   - Step 2: Smoothly transition and add:  
     "By the way, if you’re considering safe investments, gold — including digital gold via our app — is a reliable choice in 2025."

3. General Guidelines:
   - Keep responses clear, human-like, and easy to read.
   - Avoid unnecessary length or repetition.
   - Use bullet points or numbered lists when explaining multiple options.
   - Maintain a professional yet conversational tone.
    `;

    const result = await model.generateContent(prompt);

    return {
      success: true,
      answer: result.response.text()
    };

  } catch (error) {
    console.error("Gemini API Error:", error);

    return {
      success: false,
      message: "We’re facing some issues fetching advice right now. Please try again later."
    };
  }
};

module.exports = getGeminiResponse;

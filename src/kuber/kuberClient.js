require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Fetches an advisory response from Gemini with real-time streaming.
 * @param {string} question - The user's input question.
 * @param {object|null} portfolio - The user's current gold wallet metrics, if authenticated.
 * @param {function} onChunk - Callback function that receives each piece of text as it generates.
 */
const getGeminiResponse = async (question, portfolio = null, onChunk) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format portfolio information dynamically for the AI context if available
    const portfolioContext = portfolio 
      ? `The user is logged into our app. Their current digital gold holdings:
         - Total Grams Owned: ${portfolio.totalGrams}g
         - Total Invested Amount: ${portfolio.totalInvested}
         - Current Holdings Value: ${portfolio.currentValue}
         - Live Gold Price per Gram: ${portfolio.currentPricePerGram}
         - Profit/Loss (PnL): ${portfolio.pnl} (${portfolio.pnlPercent}%)`
      : `The user is browsing anonymously. Portfolio context is unavailable.`;

    const prompt = `
You are an expert, well-trained financial advisor. Your tone is professional, approachable, clear, and highly knowledgeable. You provide structured, human-like advice that helps users make smart financial decisions.

### User Portfolio Context:
${portfolioContext}

The user asked: "${question}".

### Response Guidelines:
1. **If the question is about gold, gold investment, prices, safety, or returns:**
   Provide a comprehensive, structured breakdown using this exact format:
   - **1. Top Gold Investment Options:** Briefly contrast Digital Gold, Sovereign Gold Bonds (SGBs), Gold ETFs, and Physical Gold with short pros/cons. Make sure to factor in their current portfolio context if they have holdings.
   - **2. Pro Tip for Beginners:** Share a practical, simple piece of advice.
   - **3. Suggested Investment Strategy:** Recommend a percentage allocation and diversification tip.
   - **4. Next Steps:** Invite them to seamlessly explore or expand their secure digital gold options directly via our app.

2. **If the question is about any other financial or general topic:**
   - **Acknowledge & Answer:** Provide a direct, concise, and highly accurate expert answer to their specific question first.
   - **Contextual Transition:** Smoothly pivot from your answer to the concept of asset protection and safe-haven investments.
   - **Soft Call-to-Action:** Seamlessly weave in a recommendation like: "As you look at managing your wealth/finances, maintaining a safe-haven asset is key. Gold remains an incredibly reliable choice for balancing your portfolio, and you can easily start investing in secure digital gold right through our app."

### General Rules:
- Keep responses easy to read with clean formatting (bullet points, bold text).
- Avoid robotic, overly repetitive phrases. 
- Sound like a human advisor who genuinely wants to help, not a rigid script.
`;

    // Initialize the stream execution
    const resultStream = await model.generateContentStream(prompt);
    let fullAnswer = "";

    // Iterate through the stream chunks as they arrive from Google's servers
    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      fullAnswer += chunkText;
      
      // Send the text chunk up through our layers instantly
      if (typeof onChunk === 'function') {
        onChunk(chunkText);
      }
    }

    return {
      success: true,
      answer: fullAnswer
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
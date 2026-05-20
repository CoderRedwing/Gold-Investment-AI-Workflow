const goldAdvisorService = require("../services/goldAdvisorService");
const { sanitiseQuestion } = require("../utils/sanitise");

const goldAdvisorController = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: "question is required" });

    const clean = sanitiseQuestion(question);
    if (!clean) return res.status(400).json({ success: false, message: "Invalid question" });

    // userId from JWT if authenticated, else null for anonymous
    const userId = req.user?.userId || null;

    // 1. Tell the client browser/app that we are streaming data live
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Prevents Nginx/Vercel proxies from buffering text packets

    // Send headers down the line instantly to establish the event stream connection
    res.flushHeaders();

    // 2. Execute service, forcing each chunk to flush past the node network buffer instantly
    await goldAdvisorService(clean, userId, (chunkText) => {
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      
      // If a compression library or native stream buffer is holding chunks, force dispatch it now
      if (typeof res.flush === "function") {
        res.flush();
      }
    });

    // 3. Inform the client that the stream has finished successfully
    res.write("data: [DONE]\n\n");
    return res.end();

  } catch (err) {
    console.error("Advisor Error:", err.message);

    // If headers haven't been sent yet, we can send a standard JSON error
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    
    // If mid-stream, send error packet format through the stream channel
    res.write(`data: ${JSON.stringify({ error: "Streaming interrupted" })}\n\n`);
    return res.end();
  }
};

module.exports = goldAdvisorController;
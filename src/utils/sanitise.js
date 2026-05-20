/**
 * Sanitise a user-supplied question before injecting into AI prompts.
 * Strips prompt-injection attempts and limits length.
 */
const sanitiseQuestion = (raw) => {
  if (typeof raw !== "string") return "";
  // Truncate
  let q = raw.slice(0, 500);
  // Strip common injection markers
  q = q.replace(/```[\s\S]*?```/g, "");
  q = q.replace(/(ignore|disregard|forget).{0,40}(previous|above|instructions|prompt)/gi, "");
  q = q.replace(/system\s*:/gi, "");
  // Trim whitespace
  return q.trim();
};

module.exports = { sanitiseQuestion };

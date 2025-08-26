const getGeminiResponse = require('../kuber/kuberClient');

const goldAdvisorService = async (question) => {
  return await getGeminiResponse(question);
};

module.exports = goldAdvisorService;
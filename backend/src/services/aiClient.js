const axios = require("axios");

const { config } = require("../config/env");

async function requestComposition(payload) {
  const response = await axios.post(`${config.aiServiceUrl}/compose`, payload, {
    timeout: 60000,
  });

  return response.data;
}

module.exports = { requestComposition };

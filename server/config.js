require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  semantic: {
    apiBaseUrl: process.env.SEMANTIC_API_URL || 'https://outils.agence-slashr.fr/semantique/api/v1',
    defaultLocation: process.env.SEMANTIC_LOCATION || 'France',
    timeout: parseInt(process.env.SEMANTIC_TIMEOUT) || 30000
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
  },
  valueSerp: {
    apiKey: process.env.VALUESERP_API_KEY,
    baseUrl: 'https://api.valueserp.com/search'
  }
};

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  thotSeo: {
    apiUrl: process.env.THOT_API_URL || 'https://api.thot-seo.fr/commande-api',
    apiKey: process.env.THOT_API_KEY
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION
  }
};

const axios = require('axios');
const config = require('../config');
const { Agent } = require('https');

/**
 * Service pour interagir avec l'API ThotSEO
 */
const thotSeoService = {
  /**
   * Récupère les données SEO depuis l'API ThotSEO
   * @param {string} keyword - Le mot-clé à analyser
   * @returns {Promise<Object>} - Les données ThotSEO
   */
  async fetchThotSeoData(keyword) {
    try {
      console.log(`Récupération des données ThotSEO pour le mot-clé: "${keyword}"`);
      console.log('Requête démarrée à:', new Date().toISOString());
      
      const response = await axios.get(config.thotSeo.apiUrl, {
        params: {
          keywords: keyword,
          apikey: config.thotSeo.apiKey
        },
        timeout: 300000, // 5 minutes
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        // Forcer l'utilisation d'IPv4
        httpsAgent: new Agent({
          family: 4,
          keepAlive: true
        })
      });
      
      console.log('Réponse reçue à:', new Date().toISOString());
      console.log('Statut de la réponse:', response.status);
      
      // Transformation des données pour correspondre à notre format
      const transformedData = this.transformThotSeoData(response.data);
      
      return transformedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données ThotSEO:', error);
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        
        throw new Error(`Erreur API ThotSEO (${statusCode}): ${errorMessage}`);
      } else {
        throw new Error(`Erreur API ThotSEO: ${error.message}`);
      }
    }
  },
  
  /**
   * Transforme les données brutes de ThotSEO en format utilisable par notre application
   * @param {Object} rawData - Les données brutes de l'API ThotSEO
   * @returns {Object} - Les données transformées
   */
  transformThotSeoData(rawData) {
    // Transformation des mots-clés obligatoires
    const KW_obligatoires = Array.isArray(rawData.KW_obligatoires) 
      ? rawData.KW_obligatoires.map(kw => {
          if (Array.isArray(kw) && kw.length >= 3) {
            return {
              mot: kw[0],
              frequence: kw[1],
              densite: kw[2]
            };
          }
          return null;
        }).filter(Boolean)
      : [];
    
    // Transformation des mots-clés complémentaires
    const KW_complementaires = Array.isArray(rawData.KW_complementaires)
      ? rawData.KW_complementaires.map(kw => {
          if (Array.isArray(kw) && kw.length >= 3) {
            return {
              mot: kw[0],
              frequence: kw[1],
              densite: kw[2]
            };
          }
          return null;
        }).filter(Boolean)
      : [];
    
    // Transformation des résultats SERP
    const serp_results = Array.isArray(rawData.serp_results)
      ? rawData.serp_results.map(result => ({
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || ''
        }))
      : [];
    
    // Transformation des questions (chaîne séparée par des points-virgules en tableau)
    let questions = [];
    if (rawData.questions) {
      if (typeof rawData.questions === 'string') {
        questions = rawData.questions.split(';').filter(q => q.trim() !== '');
      } else if (Array.isArray(rawData.questions)) {
        questions = rawData.questions;
      }
    }
    
    return {
      mots_requis: rawData.mots_requis || 0,
      KW_obligatoires,
      KW_complementaires,
      ngrams: rawData.ngrams || [],
      questions,
      serp_results
    };
  }
};

module.exports = thotSeoService;

const axios = require('axios');
const config = require('../config');

/**
 * Service pour interagir avec l'API sémantique SlashR
 */
const semanticService = {
  /**
   * URL de base de l'API
   */
  apiBaseUrl: 'https://outils.agence-slashr.fr/semantique/api/v1',
  
  /**
   * Timeout pour les requêtes (30 secondes)
   */
  timeout: 30000,

  /**
   * Récupère les données sémantiques depuis l'API SlashR
   * @param {string} query - La requête SEO à analyser
   * @param {string} location - La localisation (France, Belgique, Suisse, Canada)
   * @returns {Promise<Object>} - Les données sémantiques
   */
  async fetchSemanticData(query, location = 'France') {
    try {
      console.log(`Récupération des données sémantiques pour la requête: "${query}"`);
      console.log('Requête démarrée à:', new Date().toISOString());
      
      // Encoder la requête pour l'URL
      const encodedQuery = encodeURIComponent(query);
      const apiUrl = `${this.apiBaseUrl}/analyze/${encodedQuery}?location=${location}&language=fr`;
      
      console.log('URL de l\'API:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      console.log('Réponse reçue à:', new Date().toISOString());
      console.log('Statut de la réponse:', response.status);
      
      // Log détaillé de la réponse brute de l'API
      console.log('=== RÉPONSE BRUTE DE L\'API SÉMANTIQUE ===');
      console.log('Type de response.data:', typeof response.data);
      console.log('Contenu complet de response.data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.required_keywords) {
        console.log('=== MOTS-CLÉS OBLIGATOIRES BRUTS ===');
        console.log('Type de required_keywords:', typeof response.data.required_keywords);
        console.log('required_keywords:', JSON.stringify(response.data.required_keywords, null, 2));
      }
      
      if (response.data.complementary_keywords) {
        console.log('=== MOTS-CLÉS COMPLÉMENTAIRES BRUTS ===');
        console.log('Type de complementary_keywords:', typeof response.data.complementary_keywords);
        console.log('complementary_keywords:', JSON.stringify(response.data.complementary_keywords, null, 2));
      }
      
      // Transformation des données pour correspondre à notre format
      const transformedData = this.transformSemanticData(response.data, query);
      
      return transformedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données sémantiques:', error);
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        
        if (statusCode === 404) {
          throw new Error(`Aucune donnée trouvée pour la requête "${query}"`);
        } else if (statusCode === 429) {
          throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.');
        } else {
          throw new Error(`Erreur API Sémantique (${statusCode}): ${errorMessage}`);
        }
      } else {
        throw new Error(`Erreur API Sémantique: ${error.message}`);
      }
    }
  },

  /**
   * Transforme les données de l'API sémantique vers notre format interne
   * @param {Object} data - Les données brutes de l'API
   * @param {string} query - La requête originale
   * @returns {Object} - Les données transformées
   */
  transformSemanticData(data, query) {
    try {
      console.log('Transformation des données sémantiques...');
      
      // Structure des données retournées par l'API sémantique
      const transformedData = {
        // Informations de base
        query: data.query || query,
        location: 'France', // Par défaut
        
        // Mots-clés obligatoires (équivalent à KW_obligatoires de ThotSEO)
        KW_obligatoires: this.transformRequiredKeywords(data.required_keywords || []),
        
        // Mots-clés complémentaires (équivalent à KW_complementaires de ThotSEO)
        KW_complementaires: this.transformComplementaryKeywords(data.complementary_keywords || []),
        
        // Score SEO cible
        target_seo_score: data.target_seo_score || 0,
        
        // Nombre de mots recommandé
        recommended_words: data.recommended_words || 0,
        
        // Questions (vide par défaut, peut être enrichi plus tard)
        questions: [],
        
        // Métadonnées supplémentaires
        metadata: {
          analyzed_at: new Date().toISOString(),
          api_source: 'semantic_api_slashr'
        }
      };
      
      console.log('=== DONNÉES TRANSFORMÉES ===');
      console.log('Données transformées avec succès');
      console.log('Nombre de mots-clés obligatoires:', transformedData.KW_obligatoires.length);
      console.log('Nombre de mots-clés complémentaires:', transformedData.KW_complementaires.length);
      
      // Log des premiers mots-clés transformés pour vérification
      if (transformedData.KW_obligatoires.length > 0) {
        console.log('=== PREMIERS MOTS-CLÉS OBLIGATOIRES TRANSFORMÉS ===');
        transformedData.KW_obligatoires.slice(0, 5).forEach((kw, index) => {
          console.log(`${index + 1}. "${kw.mot}" - fréquence: ${kw.frequence} - type: ${kw.type}`);
        });
      }
      
      if (transformedData.KW_complementaires.length > 0) {
        console.log('=== PREMIERS MOTS-CLÉS COMPLÉMENTAIRES TRANSFORMÉS ===');
        transformedData.KW_complementaires.slice(0, 5).forEach((kw, index) => {
          console.log(`${index + 1}. "${kw.mot}" - fréquence: ${kw.frequence} - type: ${kw.type}`);
        });
      }
      
      return transformedData;
    } catch (error) {
      console.error('Erreur lors de la transformation des données:', error);
      throw new Error('Erreur lors du traitement des données sémantiques');
    }
  },

  /**
   * Transforme les mots-clés obligatoires
   * @param {Array|Object} requiredKeywords - Mots-clés obligatoires avec fréquences
   * @returns {Array} - Tableau de mots-clés formatés
   */
  transformRequiredKeywords(requiredKeywords) {
    if (!requiredKeywords) return [];
    
    try {
      console.log('=== TRANSFORMATION MOTS-CLÉS OBLIGATOIRES ===');
      console.log('Input requiredKeywords:', JSON.stringify(requiredKeywords, null, 2));
      
      let keywordsArray = [];
      
      if (Array.isArray(requiredKeywords)) {
        console.log('requiredKeywords est un array de longueur:', requiredKeywords.length);
        keywordsArray = requiredKeywords;
      } else if (typeof requiredKeywords === 'object') {
        console.log('requiredKeywords est un objet, conversion en array...');
        // Si c'est un objet avec des clés/valeurs (mot-clé: fréquence)
        keywordsArray = Object.entries(requiredKeywords).map(([mot, frequence]) => {
          console.log(`Transformation: "${mot}" -> fréquence: ${frequence} (type: ${typeof frequence})`);
          return {
            mot,
            frequence: parseInt(frequence) || 1
          };
        });
        console.log('Array après conversion:', JSON.stringify(keywordsArray, null, 2));
      }
      
      const result = keywordsArray.map(kw => {
        const transformed = {
          mot: typeof kw === 'string' ? kw : (kw.mot || kw.keyword || ''),
          frequence: typeof kw === 'object' ? (kw.frequence || kw.frequency || 1) : 1,
          type: 'obligatoire'
        };
        console.log(`Transformation finale: ${JSON.stringify(kw)} -> ${JSON.stringify(transformed)}`);
        return transformed;
      }).filter(kw => kw.mot.trim() !== '');
      
      console.log(`Résultat final: ${result.length} mots-clés transformés`);
      return result;
    } catch (error) {
      console.error('Erreur lors de la transformation des mots-clés obligatoires:', error);
      return [];
    }
  },

  /**
   * Transforme les mots-clés complémentaires
   * @param {Array} complementaryKeywords - Mots-clés complémentaires (limités à 20)
   * @returns {Array} - Tableau de mots-clés formatés
   */
  transformComplementaryKeywords(complementaryKeywords) {
    if (!Array.isArray(complementaryKeywords)) return [];
    
    try {
      return complementaryKeywords.slice(0, 20).map(kw => ({
        mot: typeof kw === 'string' ? kw : (kw.mot || kw.keyword || ''),
        frequence: typeof kw === 'object' ? (kw.frequence || kw.frequency || 1) : 1,
        type: 'complementaire'
      })).filter(kw => kw.mot.trim() !== '');
    } catch (error) {
      console.error('Erreur lors de la transformation des mots-clés complémentaires:', error);
      return [];
    }
  }
};

module.exports = semanticService; 
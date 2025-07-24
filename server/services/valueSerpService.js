const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');

/**
 * Service pour interagir avec l'API ValueSERP
 */
const valueSerpService = {
  /**
   * Récupère les résultats SERP depuis ValueSERP
   * @param {string} query - La requête de recherche
   * @param {string} location - La localisation (optionnel)
   * @returns {Promise<Object>} - Les données SERP avec structure des titres
   */
  async fetchSerpResults(query, location = 'France') {
    try {
      console.log(`Récupération des données SERP pour la requête: "${query}"`);
      console.log('Requête ValueSERP démarrée à:', new Date().toISOString());
      
      if (!config.valueSerp.apiKey) {
        throw new Error('VALUESERP_API_KEY non configurée');
      }
      
      const params = {
        api_key: config.valueSerp.apiKey,
        q: query,
        location: location,
        google_domain: 'google.fr',
        gl: 'fr',
        hl: 'fr',
        num: 10, // Top 10 résultats
        output: 'json'
      };
      
      console.log('Paramètres ValueSERP:', { ...params, api_key: '[HIDDEN]' });
      
      const response = await axios.get(config.valueSerp.baseUrl, {
        params,
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      console.log('Réponse ValueSERP reçue à:', new Date().toISOString());
      console.log('Statut de la réponse:', response.status);
      console.log('Nombre de résultats organiques:', response.data.organic_results?.length || 0);
      
      // Traiter les résultats et extraire la structure des titres
      const processedResults = await this.processSerpResults(response.data, query);
      
      return processedResults;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données ValueSERP:', error);
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message;
        
        if (statusCode === 401) {
          throw new Error('Clé API ValueSERP invalide ou expirée');
        } else if (statusCode === 429) {
          throw new Error('Limite de requêtes ValueSERP atteinte');
        } else {
          throw new Error(`Erreur API ValueSERP (${statusCode}): ${errorMessage}`);
        }
      } else {
        throw new Error(`Erreur ValueSERP: ${error.message}`);
      }
    }
  },

  /**
   * Traite les résultats SERP et extrait la structure des titres
   * @param {Object} serpData - Les données brutes de ValueSERP
   * @param {string} query - La requête originale
   * @returns {Promise<Object>} - Les données traitées avec structure des titres
   */
  async processSerpResults(serpData, query) {
    try {
      console.log('Traitement des résultats SERP...');
      
      const organicResults = serpData.organic_results || [];
      const processedResults = [];
      
      // Traiter chaque résultat organique du top 10
      for (let i = 0; i < Math.min(organicResults.length, 10); i++) {
        const result = organicResults[i];
        
        console.log(`Traitement du résultat ${i + 1}: ${result.title}`);
        
        const processedResult = {
          position: result.position || i + 1,
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          domain: this.extractDomain(result.link),
          headingStructure: null
        };
        
        // Tenter d'extraire la structure des titres depuis la page
        try {
          const headingStructure = await this.extractHeadingStructure(result.link);
          processedResult.headingStructure = headingStructure;
          console.log(`Structure des titres extraite pour ${processedResult.domain}:`, headingStructure?.summary);
        } catch (error) {
          console.warn(`Impossible d'extraire la structure des titres pour ${result.link}:`, error.message);
          processedResult.headingStructure = {
            error: error.message,
            summary: { total: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
            headings: []
          };
        }
        
        processedResults.push(processedResult);
      }
      
      // Analyser la structure globale des titres
      const globalStructureAnalysis = this.analyzeGlobalHeadingStructure(processedResults);
      
      console.log('Traitement SERP terminé avec succès');
      console.log('Analyse globale des structures:', globalStructureAnalysis.summary);
      
      return {
        query,
        totalResults: serpData.search_information?.total_results || 0,
        processedAt: new Date().toISOString(),
        organicResults: processedResults,
        globalHeadingAnalysis: globalStructureAnalysis,
        // Données originales conservées pour référence
        rawSerpData: {
          searchInformation: serpData.search_information,
          knowledgeGraph: serpData.knowledge_graph,
          peopleAlsoAsk: serpData.people_also_ask
        }
      };
      
    } catch (error) {
      console.error('Erreur lors du traitement des résultats SERP:', error);
      throw new Error(`Erreur de traitement SERP: ${error.message}`);
    }
  },

  /**
   * Extrait la structure des titres d'une page web
   * @param {string} url - L'URL de la page à analyser
   * @returns {Promise<Object>} - La structure des titres
   */
  async extractHeadingStructure(url) {
    try {
      // Timeout plus court pour éviter de bloquer
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate'
        },
        maxRedirects: 3,
        maxContentLength: 1024 * 1024 // 1MB max
      });
      
      const $ = cheerio.load(response.data);
      const headings = [];
      const summary = { total: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
      
      // Extraire tous les titres H1-H6
      $('h1, h2, h3, h4, h5, h6').each((index, element) => {
        const $element = $(element);
        const tagName = element.tagName.toLowerCase();
        const text = $element.text().trim();
        
        if (text && text.length > 0 && text.length < 200) { // Filtrer les titres trop longs
          headings.push({
            level: parseInt(tagName.substring(1)),
            tag: tagName,
            text: text,
            position: index + 1
          });
          
          summary[tagName]++;
          summary.total++;
        }
      });
      
      return {
        url,
        extractedAt: new Date().toISOString(),
        summary,
        headings: headings.slice(0, 50), // Limiter à 50 titres max
        hasStructuredData: headings.length > 0
      };
      
    } catch (error) {
      // Ne pas faire échouer tout le processus pour une page
      throw new Error(`Extraction impossible: ${error.message}`);
    }
  },

  /**
   * Analyse la structure globale des titres de tous les résultats
   * @param {Array} results - Les résultats traités
   * @returns {Object} - L'analyse globale
   */
  analyzeGlobalHeadingStructure(results) {
    const globalSummary = { total: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
    const commonPatterns = [];
    const allHeadings = [];
    
    results.forEach(result => {
      if (result.headingStructure && result.headingStructure.headings) {
        // Agrégation des statistiques
        Object.keys(globalSummary).forEach(key => {
          if (result.headingStructure.summary[key]) {
            globalSummary[key] += result.headingStructure.summary[key];
          }
        });
        
        // Collecte de tous les titres pour analyse
        result.headingStructure.headings.forEach(heading => {
          allHeadings.push({
            ...heading,
            domain: result.domain,
            position: result.position
          });
        });
      }
    });
    
    // Analyser les patterns communs dans les titres H2 et H3
    const h2Texts = allHeadings.filter(h => h.level === 2).map(h => h.text.toLowerCase());
    const h3Texts = allHeadings.filter(h => h.level === 3).map(h => h.text.toLowerCase());
    
    const commonH2Patterns = this.findCommonPatterns(h2Texts);
    const commonH3Patterns = this.findCommonPatterns(h3Texts);
    
    return {
      summary: globalSummary,
      averageHeadingsPerPage: Math.round(globalSummary.total / results.length),
      commonPatterns: {
        h2: commonH2Patterns,
        h3: commonH3Patterns
      },
      totalPagesAnalyzed: results.length,
      pagesWithStructure: results.filter(r => r.headingStructure?.hasStructuredData).length
    };
  },

  /**
   * Trouve les patterns communs dans les textes
   * @param {Array} texts - Tableau de textes à analyser
   * @returns {Array} - Patterns communs
   */
  findCommonPatterns(texts) {
    const wordFrequency = {};
    const patterns = [];
    
    texts.forEach(text => {
      // Extraire les mots significatifs (plus de 3 caractères)
      const words = text.match(/\b\w{4,}\b/g) || [];
      words.forEach(word => {
        const cleanWord = word.toLowerCase();
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      });
    });
    
    // Garder seulement les mots qui apparaissent dans au moins 2 pages
    Object.entries(wordFrequency)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word, count]) => {
        patterns.push({ word, frequency: count, percentage: Math.round((count / texts.length) * 100) });
      });
    
    return patterns;
  },

  /**
   * Extrait le domaine d'une URL
   * @param {string} url - L'URL
   * @returns {string} - Le domaine
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  }
};

module.exports = valueSerpService; 
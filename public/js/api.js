/**
 * Client API pour communiquer avec le backend
 */
const api = {
    /**
     * URL de base de l'API
     */
    baseUrl: '/api',
    
    /**
     * Récupère les données ThotSEO
     * @param {string} keyword - Le mot-clé à analyser
     * @returns {Promise<Object>} - Les données ThotSEO
     */
    async fetchThotSeoData(keyword) {
        try {
            const response = await fetch(`${this.baseUrl}/thot-seo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Erreur lors de la récupération des données ThotSEO');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching Thot SEO data:', error);
            throw error;
        }
    },
    
    /**
     * Génère un plan de contenu
     * @param {string} keyword - Le mot-clé principal
     * @param {Object} thotSeoData - Les données ThotSEO
     * @param {string} customPrompt - Prompt personnalisé (optionnel)
     * @returns {Promise<Object>} - Le plan de contenu
     */
    async generateContentPlan(keyword, thotSeoData, customPrompt = '') {
        try {
            const response = await fetch(`${this.baseUrl}/content-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    thotSeoData,
                    customPrompt
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Erreur lors de la génération du plan de contenu');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error generating content plan:', error);
            throw error;
        }
    },
    
    /**
     * Génère une analyse de contenu
     * @param {string} keyword - Le mot-clé principal
     * @param {Object} thotSeoData - Les données ThotSEO
     * @returns {Promise<Object>} - L'analyse de contenu
     */
    async generateContentAnalysis(keyword, thotSeoData) {
        try {
            const response = await fetch(`${this.baseUrl}/content-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    thotSeoData
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Erreur lors de la génération de l\'analyse de contenu');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error generating content analysis:', error);
            throw error;
        }
    },
    
    /**
     * Génère des métadonnées SEO
     * @param {string} keyword - Le mot-clé principal
     * @param {Object} contentAnalysis - L'analyse de contenu
     * @returns {Promise<Object>} - Les métadonnées SEO
     */
    async generateSeoMetadata(keyword, contentAnalysis) {
        try {
            const response = await fetch(`${this.baseUrl}/seo-metadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    contentAnalysis
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Erreur lors de la génération des métadonnées SEO');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error generating SEO metadata:', error);
            throw error;
        }
    },
    
    /**
     * Génère un brief complet
     * @param {string} keyword - Le mot-clé principal
     * @param {string} customPrompt - Prompt personnalisé (optionnel)
     * @returns {Promise<Object>} - Le brief complet
     */
    async generateBrief(keyword, customPrompt = '') {
        try {
            const response = await fetch(`${this.baseUrl}/generate-brief`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    customPrompt
                }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Erreur lors de la génération du brief');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error generating brief:', error);
            throw error;
        }
    }
};

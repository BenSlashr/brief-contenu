/**
 * Client API pour communiquer avec le backend
 */
const api = {
    /**
     * URL de base de l'API
     */
    baseUrl: '/api',
    
    /**
     * Récupère les données sémantiques
     * @param {string} keyword - Le mot-clé à analyser
     * @param {string} location - La localisation (optionnel)
     * @returns {Promise<Object>} - Les données sémantiques
     */
    async fetchSemanticData(keyword, location = 'France') {
        try {
            const response = await fetch(`${this.baseUrl}/semantic-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword, location }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Erreur lors de la récupération des données sémantiques');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching semantic data:', error);
            throw error;
        }
    },
    
    /**
     * Génère un plan de contenu
     * @param {string} keyword - Le mot-clé principal
     * @param {Object} semanticData - Les données sémantiques
     * @param {string} customPrompt - Prompt personnalisé (optionnel)
     * @returns {Promise<Object>} - Le plan de contenu
     */
    async generateContentPlan(keyword, semanticData, customPrompt = '') {
        try {
            const response = await fetch(`${this.baseUrl}/content-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    semanticData,
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
     * @param {Object} semanticData - Les données sémantiques
     * @returns {Promise<Object>} - L'analyse de contenu
     */
    async generateContentAnalysis(keyword, semanticData) {
        try {
            const response = await fetch(`${this.baseUrl}/content-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    semanticData
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
     * @param {string} location - La localisation (optionnel)
     * @returns {Promise<Object>} - Le brief complet
     */
    async generateBrief(keyword, customPrompt = '', location = 'France') {
        try {
            const response = await fetch(`${this.baseUrl}/generate-brief`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    keyword,
                    customPrompt,
                    location
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
    },

    /**
     * Génère un PDF du brief
     * @param {Object} briefData - Les données du brief
     * @returns {Promise<Blob>} - Le blob du PDF
     */
    async generatePdf(briefData) {
        try {
            const response = await fetch(`${this.baseUrl}/generate-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ briefData }),
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Erreur lors de la génération du PDF' }));
                throw new Error(error.message || error.error || 'Erreur lors de la génération du PDF');
            }
            
            return await response.blob();
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
};

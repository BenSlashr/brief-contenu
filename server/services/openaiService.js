const { OpenAI } = require('openai');
const config = require('../config');

// Initialisation du client OpenAI
const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

console.log('OpenAI API Key configurée:', config.openai.apiKey ? 'Oui' : 'Non');

/**
 * Service pour interagir avec l'API OpenAI
 */
const openaiService = {
  /**
   * Génère un plan de contenu à partir du mot-clé et des données ThotSEO
   * @param {string} keyword - Le mot-clé principal
   * @param {Object} thotSeoData - Les données ThotSEO
   * @param {string} customPrompt - Prompt personnalisé (optionnel)
   * @returns {Promise<Object>} - Le plan de contenu
   */
  async generateContentPlan(keyword, thotSeoData, customPrompt = '') {
    try {
      console.log(`Génération du plan de contenu pour le mot-clé: "${keyword}"`);
      
      // Traitement sécurisé des questions
      let questionsText = 'Non disponible';
      if (thotSeoData.questions) {
        if (Array.isArray(thotSeoData.questions)) {
          questionsText = thotSeoData.questions.join(', ');
        } else if (typeof thotSeoData.questions === 'string') {
          questionsText = thotSeoData.questions;
        } else if (typeof thotSeoData.questions === 'object') {
          // Si c'est un objet, essayons d'extraire les valeurs
          questionsText = Object.values(thotSeoData.questions).filter(q => q).join(', ');
        }
      }

      const prompt = `En tant qu'expert SEO, créez un plan de contenu détaillé pour le mot-clé "${keyword}".

Voici les données d'analyse SEO :
- Questions fréquentes : ${questionsText}
- Sujets essentiels : ${thotSeoData.KW_obligatoires?.map(kw => kw.mot).join(', ') || 'Non disponible'}

${customPrompt || ''}

Réponds au format JSON avec la structure suivante :
{
  "objectives": ["Liste des objectifs principaux du contenu", "Maximum 5 objectifs"],
  "contentObjective": "Un paragraphe décrivant l'objectif principal du contenu, son angle et sa valeur ajoutée pour le lecteur",
  "tone": ["Ton à adopter", "Ex: professionnel, conversationnel, informatif"],
  "style": ["Style d'écriture", "Ex: direct, détaillé, storytelling"],
  "sections": [
    {
      "title": "Titre de la section (H1)",
      "subsections": [
        "Sous-titre (H2) - Inclure des balises HTML pour indiquer la hiérarchie",
        "Sous-titre (H2)",
        "Sous-titre (H2) avec [H3] Sous-sous-titre"
      ]
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert SEO spécialisé dans la création de plans de contenu optimisés. Répondez uniquement au format JSON demandé."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content || '{}';
      const openAiResponse = JSON.parse(response);

      // Traitement des sections
      const sections = [];
      
      // Traiter toutes les sections
      if (Array.isArray(openAiResponse.sections)) {
        openAiResponse.sections.forEach((section) => {
          if (section.title && Array.isArray(section.subsections)) {
            sections.push({
              title: section.title,
              subsections: section.subsections
            });
          }
        });
      }
      
      // Si aucune section n'a été trouvée, créer une structure par défaut
      if (sections.length === 0) {
        sections.push(
          {
            title: "Introduction",
            subsections: ["Présentation du sujet"]
          },
          {
            title: "Développement",
            subsections: ["Points clés à aborder"]
          },
          {
            title: "Conclusion",
            subsections: ["Synthèse et recommandations"]
          }
        );
      }

      return {
        objectives: openAiResponse.objectives || [],
        contentObjective: openAiResponse.contentObjective || '',
        tone: openAiResponse.tone || ["Professionnel", "Informatif"],
        style: openAiResponse.style || ["Clair", "Précis"],
        valueProposition: thotSeoData.valueProposition || "",
        sections: sections,
        essentialTopics: thotSeoData.essential_topics || 
          thotSeoData.KW_obligatoires?.slice(0, 5).map(kw => kw.mot) || [],
        keyQuestions: thotSeoData.key_questions || 
          thotSeoData.questions?.slice(0, 3) || [],
        questions: thotSeoData.questions || []
      };
    } catch (error) {
      console.error('Erreur lors de la génération du plan de contenu:', error);
      throw new Error(`Erreur de génération du plan de contenu: ${error.message}`);
    }
  },

  /**
   * Génère une analyse de contenu à partir du mot-clé et des données ThotSEO
   * @param {string} keyword - Le mot-clé principal
   * @param {Object} thotSeoData - Les données ThotSEO
   * @returns {Promise<Object>} - L'analyse de contenu
   */
  async generateContentAnalysis(keyword, thotSeoData) {
    try {
      console.log(`Génération de l'analyse de contenu pour le mot-clé: "${keyword}"`);
      
      const serpResults = thotSeoData.serp_results?.slice(0, 5) || [];
      const serpAnalysis = serpResults.map((result, index) => 
        `Article ${index + 1}:
Titre: ${result.title}
URL: ${result.link}
Extrait: ${result.snippet}`
      ).join('\n\n');

      // Traitement sécurisé des questions
      let questionsText = 'Non disponible';
      if (thotSeoData.questions) {
        if (Array.isArray(thotSeoData.questions)) {
          questionsText = thotSeoData.questions.join(', ');
        } else if (typeof thotSeoData.questions === 'string') {
          questionsText = thotSeoData.questions;
        } else if (typeof thotSeoData.questions === 'object') {
          // Si c'est un objet, essayons d'extraire les valeurs
          questionsText = Object.values(thotSeoData.questions).filter(q => q).join(', ');
        }
      }

      const prompt = `En tant qu'expert SEO et analyste de contenu, analyse en profondeur le mot-clé "${keyword}" et les contenus existants.

Voici les données d'analyse SEO :
- Questions fréquentes : ${questionsText}
- Mots-clés obligatoires : ${thotSeoData.KW_obligatoires?.map(kw => kw.mot).join(', ') || 'Non disponible'}
- Mots-clés complémentaires : ${thotSeoData.KW_complementaires?.map(kw => kw.mot).join(', ') || 'Non disponible'}

Analyse des 5 premiers résultats de recherche :
${serpAnalysis}

1. Analyse approfondie des contenus concurrents :
- Identifie les points communs et les différences dans la structure
- Estime le nombre d'images et de vidéos utilisées dans chaque article
- Analyse le style et le ton employés
- Identifie les sujets traités et manquants

2. Recommandations pour notre contenu :
- Nombre optimal d'images recommandé
- Nombre optimal de vidéos recommandé
- Sujets à couvrir impérativement
- Angles uniques à explorer
- Style et ton à adopter

Réponds au format JSON avec la structure suivante :
{
  "context": {
    "primaryIntent": "...",
    "objectives": ["...", "..."]
  },
  "mainTopics": {
    "essentialTopics": ["...", "..."],
    "keyQuestions": ["...", "..."]
  },
  "writingStyle": {
    "tone": ["...", "..."],
    "style": ["...", "..."]
  },
  "valueProposition": "...",
  "mediaRecommendations": {
    "images": {
      "count": 5,
      "suggestions": ["Type d'image 1", "Type d'image 2"]
    },
    "videos": {
      "count": 2,
      "suggestions": ["Type de vidéo 1", "Type de vidéo 2"]
    }
  },
  "competitorAnalysis": {
    "commonTopics": ["...", "..."],
    "missingTopics": ["...", "..."],
    "averageMediaCounts": {
      "images": 5,
      "videos": 1
    }
  }
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert SEO spécialisé dans l'analyse de contenu et l'optimisation. Vous devez analyser en profondeur les contenus concurrents et fournir des recommandations détaillées. Répondez uniquement au format JSON demandé."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content || '{}';
      const parsedResponse = JSON.parse(response);

      return {
        context: {
          primaryIntent: parsedResponse.context?.primaryIntent || '',
          objectives: parsedResponse.context?.objectives || []
        },
        mainTopics: {
          essentialTopics: parsedResponse.mainTopics?.essentialTopics || [],
          keyQuestions: parsedResponse.mainTopics?.keyQuestions || []
        },
        writingStyle: {
          tone: parsedResponse.writingStyle?.tone || [],
          style: parsedResponse.writingStyle?.style || []
        },
        valueProposition: parsedResponse.valueProposition || '',
        mediaRecommendations: parsedResponse.mediaRecommendations || {
          images: { count: 0, suggestions: [] },
          videos: { count: 0, suggestions: [] }
        },
        competitorAnalysis: parsedResponse.competitorAnalysis || {
          commonTopics: [],
          missingTopics: [],
          averageMediaCounts: { images: 0, videos: 0 }
        }
      };
    } catch (error) {
      console.error('Erreur lors de la génération de l\'analyse de contenu:', error);
      throw new Error(`Erreur de génération de l'analyse de contenu: ${error.message}`);
    }
  },

  /**
   * Génère des métadonnées SEO à partir du mot-clé et de l'analyse de contenu
   * @param {string} keyword - Le mot-clé principal
   * @param {Object} contentAnalysis - L'analyse de contenu
   * @returns {Promise<Object>} - Les métadonnées SEO
   */
  async generateSeoMetadata(keyword, contentAnalysis) {
    try {
      console.log(`Génération des métadonnées SEO pour le mot-clé: "${keyword}"`);
      
      const prompt = `En tant qu'expert SEO, génère des métadonnées optimisées pour un article sur "${keyword}".

Voici l'analyse de contenu :
- Intention principale : ${contentAnalysis.context?.primaryIntent || 'Non disponible'}
- Objectifs : ${contentAnalysis.context?.objectives?.join(', ') || 'Non disponible'}
- Sujets essentiels : ${contentAnalysis.mainTopics?.essentialTopics?.join(', ') || 'Non disponible'}

Génère les métadonnées suivantes :
1. Un slug URL optimisé pour le SEO (sans espaces, avec des tirets)
2. Un title tag optimisé (60-65 caractères maximum)
3. Une meta description optimisée (150-160 caractères maximum)

Réponds au format JSON avec la structure suivante :
{
  "slug": "...",
  "title": "...",
  "metaDescription": "..."
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert SEO spécialisé dans l'optimisation des métadonnées. Répondez uniquement au format JSON demandé."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content || '{}';
      const parsedResponse = JSON.parse(response);

      return {
        slug: parsedResponse.slug || this.generateSlug(keyword),
        title: parsedResponse.title || `${keyword} - Guide Complet`,
        metaDescription: parsedResponse.metaDescription || `Découvrez tout ce que vous devez savoir sur ${keyword}. Guide complet avec conseils d'experts et informations détaillées.`
      };
    } catch (error) {
      console.error('Erreur lors de la génération des métadonnées SEO:', error);
      throw new Error(`Erreur de génération des métadonnées SEO: ${error.message}`);
    }
  },

  /**
   * Génère un slug à partir d'un mot-clé
   * @param {string} keyword - Le mot-clé
   * @returns {string} - Le slug
   */
  generateSlug(keyword) {
    return keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

module.exports = openaiService;

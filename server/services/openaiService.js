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
   * Génère un plan de contenu à partir du mot-clé, des données sémantiques et de la structure SERP
   * @param {string} keyword - Le mot-clé principal
   * @param {Object} semanticData - Les données sémantiques
   * @param {string} customPrompt - Prompt personnalisé (optionnel)
   * @param {Object} serpData - Les données SERP avec structure des titres (optionnel)
   * @returns {Promise<Object>} - Le plan de contenu
   */
  async generateContentPlan(keyword, semanticData, customPrompt = '', serpData = null) {
    try {
      console.log(`Génération du plan de contenu pour le mot-clé: "${keyword}"`);
      
      // Traitement sécurisé des questions
      let questionsText = 'Non disponible';
      if (semanticData.questions) {
        if (Array.isArray(semanticData.questions)) {
          questionsText = semanticData.questions.join(', ');
        } else if (typeof semanticData.questions === 'string') {
          questionsText = semanticData.questions;
        } else if (typeof semanticData.questions === 'object') {
          // Si c'est un objet, essayons d'extraire les valeurs
          questionsText = Object.values(semanticData.questions).filter(q => q).join(', ');
        }
      }

      // Analyser la structure SERP si disponible
      let serpAnalysis = '';
      if (serpData && serpData.globalHeadingAnalysis) {
        const analysis = serpData.globalHeadingAnalysis;
        serpAnalysis = `
ANALYSE DE LA STRUCTURE DES TITRES DU TOP 10 SERP :
- Pages analysées : ${analysis.totalPagesAnalyzed}/10
- Moyenne de titres par page : ${analysis.averageHeadingsPerPage}
- Répartition globale : H1(${analysis.summary.h1}) H2(${analysis.summary.h2}) H3(${analysis.summary.h3}) H4(${analysis.summary.h4}) H5(${analysis.summary.h5}) H6(${analysis.summary.h6})

PATTERNS COMMUNS DANS LES TITRES H2 :
${analysis.commonPatterns.h2?.map(p => `- "${p.word}" (${p.frequency} occurrences, ${p.percentage}%)`).join('\n') || '- Aucun pattern significatif détecté'}

PATTERNS COMMUNS DANS LES TITRES H3 :
${analysis.commonPatterns.h3?.map(p => `- "${p.word}" (${p.frequency} occurrences, ${p.percentage}%)`).join('\n') || '- Aucun pattern significatif détecté'}

PLANS COMPLETS DES CONCURRENTS (TOP 5) :
${serpData.organicResults?.slice(0, 5).map((result, index) => {
  if (result.headingStructure?.headings?.length > 0) {
    // Limiter à 20 titres max par concurrent pour éviter un prompt trop long
    const limitedHeadings = result.headingStructure.headings.slice(0, 20);
    return `--- CONCURRENT ${index + 1}: ${result.domain} ---
TITRE: ${result.title}
PLAN COMPLET:
${limitedHeadings.map(h => {
  const indent = '  '.repeat(h.level - 1);
  return `${indent}${h.tag.toUpperCase()}: ${h.text}`;
}).join('\n')}${result.headingStructure.headings.length > 20 ? '\n[... structure tronquée, voir plus de titres]' : ''}
`;
  }
  return `--- CONCURRENT ${index + 1}: ${result.domain} ---
TITRE: ${result.title}
PLAN: Structure non disponible (page inaccessible)
`;
}).join('\n') || 'Aucune structure extraite des concurrents'}

ANALYSE RAPIDE DES AUTRES CONCURRENTS (6-10) :
${serpData.organicResults?.slice(5).map((result, index) => {
  if (result.headingStructure?.headings?.length > 0) {
    const h2Titles = result.headingStructure.headings.filter(h => h.level === 2).slice(0, 5);
    return `${result.domain}: ${h2Titles.map(h => h.text).join(' | ')}`;
  }
  return `${result.domain}: Structure non disponible`;
}).join('\n') || 'Aucun autre concurrent analysé'}`;
      }

      const prompt = `En tant qu'expert SEO, créez un plan de contenu détaillé pour le mot-clé "${keyword}".

DONNÉES D'ANALYSE SÉMANTIQUE :
- Score SEO cible : ${semanticData.target_seo_score || 'Non disponible'}
- Nombre de mots recommandé : ${semanticData.recommended_words || 'Non disponible'}
- Mots-clés obligatoires : ${semanticData.KW_obligatoires?.map(kw => kw.mot).join(', ') || 'Non disponible'}
- Mots-clés complémentaires : ${semanticData.KW_complementaires?.slice(0, 10).map(kw => kw.mot).join(', ') || 'Non disponible'}

${serpAnalysis}

INSTRUCTIONS SPÉCIFIQUES :
${customPrompt || 'Créez le plan ultime qui respecte les bonnes pratiques SEO en te basant sur les mots-clés et ce qu\'a fait la concurrence. Le but est de traiter le sujet en profondeur.'}

CONSIGNES POUR CRÉER LE PLAN ULTIME :
1. ANALYSEZ CHAQUE PLAN CONCURRENT : Étudiez en détail tous les plans fournis ci-dessus
2. IDENTIFIEZ LES SUJETS RÉCURRENTS : Notez les thèmes traités par plusieurs concurrents
3. TROUVEZ LES GAPS : Identifiez les sujets manquants ou peu développés
4. CRÉEZ UNE SYNTHÈSE OPTIMALE : Combinez le meilleur de chaque concurrent
5. AJOUTEZ DE LA VALEUR : Proposez des sections uniques et approfondies
6. RESPECTEZ LA HIÉRARCHIE : H1 > H2 > H3 > H4 avec une logique claire
7. INTÉGREZ LES MOTS-CLÉS : Placez naturellement les mots-clés obligatoires dans les titres
8. VISEZ L'EXHAUSTIVITÉ : Votre plan doit être plus complet que tous les concurrents

OBJECTIF : Créer LE plan de référence qui surpasse tous les concurrents en profondeur et en structure.

Réponds au format JSON avec la structure suivante :
{
  "objectives": ["Liste des objectifs principaux du contenu", "Maximum 5 objectifs"],
  "contentObjective": "Un paragraphe décrivant l'objectif principal du contenu, son angle et sa valeur ajoutée pour le lecteur",
  "tone": ["Ton à adopter", "Ex: professionnel, conversationnel, informatif"],
  "style": ["Style d'écriture", "Ex: direct, détaillé, storytelling"],
  "competitorAnalysis": {
    "commonTopics": ["Sujets traités par la majorité des concurrents"],
    "missingOpportunities": ["Sujets peu ou pas traités par les concurrents"],
    "structureInsights": "Analyse de la structure des titres concurrents",
    "bestPracticesIdentified": ["Meilleures pratiques observées chez les concurrents"],
    "differentiationStrategy": "Comment ce plan se démarque et apporte plus de valeur"
  },
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

      // Vérifier la longueur du prompt
      if (prompt.length > 15000) {
        console.warn('Prompt très long détecté:', prompt.length, 'caractères');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert SEO spécialisé dans la création de plans de contenu optimisés. Analysez les structures concurrentes et créez un plan exhaustif qui les surpasse. Répondez uniquement au format JSON demandé, même si vous devez raccourcir certaines sections."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content || '{}';
      console.log('Réponse brute OpenAI:', response);
      
      let openAiResponse;
      try {
        openAiResponse = JSON.parse(response);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        console.error('Contenu reçu:', response);
        
        // Fallback avec une structure basique
        openAiResponse = {
          objectives: ["Créer un contenu SEO optimisé"],
          contentObjective: "Fournir une ressource complète sur le sujet demandé",
          tone: ["Professionnel", "Informatif"],
          style: ["Clair", "Structuré"],
          competitorAnalysis: {
            commonTopics: ["Analyse en cours"],
            missingOpportunities: ["À identifier"],
            structureInsights: "Structure concurrentielle analysée",
            bestPracticesIdentified: ["Bonnes pratiques identifiées"],
            differentiationStrategy: "Stratégie de différenciation en développement"
          },
          sections: [{
            title: `Guide complet : ${keyword}`,
            subsections: [
              "Introduction et définition",
              "Aspects techniques",
              "Meilleures pratiques",
              "Conclusion et recommandations"
            ]
          }]
        };
      }

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
        valueProposition: semanticData.valueProposition || "",
        sections: sections,
        essentialTopics: semanticData.essential_topics || 
          semanticData.KW_obligatoires?.slice(0, 5).map(kw => kw.mot) || [],
        keyQuestions: semanticData.key_questions || 
          semanticData.questions?.slice(0, 3) || [],
        questions: semanticData.questions || []
      };
    } catch (error) {
      console.error('Erreur lors de la génération du plan de contenu:', error);
      throw new Error(`Erreur de génération du plan de contenu: ${error.message}`);
    }
  },

  /**
   * Génère une analyse de contenu à partir du mot-clé et des données sémantiques
   * @param {string} keyword - Le mot-clé principal
   * @param {Object} semanticData - Les données sémantiques
   * @returns {Promise<Object>} - L'analyse de contenu
   */
  async generateContentAnalysis(keyword, semanticData) {
    try {
      console.log(`Génération de l'analyse de contenu pour le mot-clé: "${keyword}"`);
      
      // Note: L'API sémantique ne fournit pas de résultats SERP, nous nous concentrons sur l'analyse sémantique
      
      // Traitement sécurisé des questions
      let questionsText = 'Non disponible';
      if (semanticData.questions) {
        if (Array.isArray(semanticData.questions)) {
          questionsText = semanticData.questions.join(', ');
        } else if (typeof semanticData.questions === 'string') {
          questionsText = semanticData.questions;
        } else if (typeof semanticData.questions === 'object') {
          // Si c'est un objet, essayons d'extraire les valeurs
          questionsText = Object.values(semanticData.questions).filter(q => q).join(', ');
        }
      }

      const prompt = `En tant qu'expert SEO et analyste de contenu, analyse en profondeur le mot-clé "${keyword}" basé sur l'analyse sémantique.

Voici les données d'analyse sémantique :
- Score SEO cible : ${semanticData.target_seo_score || 'Non disponible'}
- Nombre de mots recommandé : ${semanticData.recommended_words || 'Non disponible'}
- Mots-clés obligatoires : ${semanticData.KW_obligatoires?.map(kw => kw.mot).join(', ') || 'Non disponible'}
- Mots-clés complémentaires : ${semanticData.KW_complementaires?.map(kw => kw.mot).join(', ') || 'Non disponible'}

Basé sur l'analyse sémantique, fournissez des recommandations pour créer un contenu optimisé :

1. Analyse sémantique approfondie :
- Identifie l'intention de recherche principale
- Détermine les sujets essentiels à couvrir
- Analyse la densité sémantique requise
- Évalue la difficulté concurrentielle

2. Recommandations pour notre contenu :
- Structure optimale basée sur les mots-clés obligatoires
- Intégration naturelle des mots-clés complémentaires
- Longueur de contenu recommandée (${semanticData.recommended_words || 'Non spécifié'} mots)
- Score SEO à atteindre (${semanticData.target_seo_score || 'Non spécifié'})
- Nombre optimal d'images et vidéos recommandé
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
  "semanticAnalysis": {
    "targetScore": "${semanticData.target_seo_score || 'Non spécifié'}",
    "recommendedWords": "${semanticData.recommended_words || 'Non spécifié'}",
    "keywordDensity": "Recommandations pour l'intégration des mots-clés",
    "contentStructure": "Structure optimale basée sur l'analyse sémantique"
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

const express = require('express');
const router = express.Router();
const thotSeoService = require('../services/thotSeoService');
const openaiService = require('../services/openaiService');

// Route pour récupérer les données ThotSEO
router.post('/thot-seo', async (req, res, next) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Le mot-clé est requis' });
    }
    
    const data = await thotSeoService.fetchThotSeoData(keyword);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Route pour générer un plan de contenu
router.post('/content-plan', async (req, res, next) => {
  try {
    const { keyword, thotSeoData, customPrompt } = req.body;
    
    if (!keyword || !thotSeoData) {
      return res.status(400).json({ error: 'Le mot-clé et les données ThotSEO sont requis' });
    }
    
    const contentPlan = await openaiService.generateContentPlan(keyword, thotSeoData, customPrompt);
    res.json(contentPlan);
  } catch (error) {
    next(error);
  }
});

// Route pour générer une analyse de contenu
router.post('/content-analysis', async (req, res, next) => {
  try {
    const { keyword, thotSeoData } = req.body;
    
    if (!keyword || !thotSeoData) {
      return res.status(400).json({ error: 'Le mot-clé et les données ThotSEO sont requis' });
    }
    
    const contentAnalysis = await openaiService.generateContentAnalysis(keyword, thotSeoData);
    res.json(contentAnalysis);
  } catch (error) {
    next(error);
  }
});

// Route pour générer des métadonnées SEO
router.post('/seo-metadata', async (req, res, next) => {
  try {
    const { keyword, contentAnalysis } = req.body;
    
    if (!keyword || !contentAnalysis) {
      return res.status(400).json({ error: 'Le mot-clé et l\'analyse de contenu sont requis' });
    }
    
    const seoMetadata = await openaiService.generateSeoMetadata(keyword, contentAnalysis);
    res.json(seoMetadata);
  } catch (error) {
    next(error);
  }
});

// Route pour générer un brief complet
router.post('/generate-brief', async (req, res, next) => {
  try {
    const { keyword, customPrompt } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Le mot-clé est requis' });
    }
    
    // 1. Récupérer les données ThotSEO
    const thotSeoData = await thotSeoService.fetchThotSeoData(keyword);
    
    // 2. Générer l'analyse de contenu
    const contentAnalysis = await openaiService.generateContentAnalysis(keyword, thotSeoData);
    
    // 3. Générer le plan de contenu
    const contentPlan = await openaiService.generateContentPlan(keyword, thotSeoData, customPrompt);
    
    // 4. Générer les métadonnées SEO
    const seoMetadata = await openaiService.generateSeoMetadata(keyword, contentAnalysis);
    
    // 5. Assembler le brief complet
    const briefData = {
      keyword,
      customPrompt,
      thotSeoData,
      contentPlan,
      contentAnalysis,
      seoMetadata
    };
    
    res.json(briefData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

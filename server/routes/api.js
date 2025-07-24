const express = require('express');
const router = express.Router();
const semanticService = require('../services/semanticService');
const openaiService = require('../services/openaiService');
const pdfService = require('../services/pdfService');
const valueSerpService = require('../services/valueSerpService');

// Route pour récupérer les données sémantiques
router.post('/semantic-data', async (req, res, next) => {
  try {
    const { keyword, location } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Le mot-clé est requis' });
    }
    
    const data = await semanticService.fetchSemanticData(keyword, location);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Route pour générer un plan de contenu
router.post('/content-plan', async (req, res, next) => {
  try {
    const { keyword, semanticData, customPrompt } = req.body;
    
    if (!keyword || !semanticData) {
      return res.status(400).json({ error: 'Le mot-clé et les données sémantiques sont requis' });
    }
    
    const contentPlan = await openaiService.generateContentPlan(keyword, semanticData, customPrompt);
    res.json(contentPlan);
  } catch (error) {
    next(error);
  }
});

// Route pour générer une analyse de contenu
router.post('/content-analysis', async (req, res, next) => {
  try {
    const { keyword, semanticData } = req.body;
    
    if (!keyword || !semanticData) {
      return res.status(400).json({ error: 'Le mot-clé et les données sémantiques sont requis' });
    }
    
    const contentAnalysis = await openaiService.generateContentAnalysis(keyword, semanticData);
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
    const { keyword, customPrompt, location } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Le mot-clé est requis' });
    }
    
    // 1. Récupérer les données sémantiques
    const semanticData = await semanticService.fetchSemanticData(keyword, location);
    
    // 2. Récupérer les données SERP avec structure des titres
    const serpData = await valueSerpService.fetchSerpResults(keyword, location);
    
    // 3. Générer l'analyse de contenu
    const contentAnalysis = await openaiService.generateContentAnalysis(keyword, semanticData);
    
    // 4. Générer le plan de contenu avec la structure SERP
    const contentPlan = await openaiService.generateContentPlan(keyword, semanticData, customPrompt, serpData);
    
    // 5. Générer les métadonnées SEO
    const seoMetadata = await openaiService.generateSeoMetadata(keyword, contentAnalysis);
    
    // 6. Assembler le brief complet
    const briefData = {
      keyword,
      customPrompt,
      location: location || 'France',
      semanticData,
      serpData,
      contentPlan,
      contentAnalysis,
      seoMetadata
    };
    
    res.json(briefData);
  } catch (error) {
    next(error);
  }
});

// Route pour générer un PDF du brief
router.post('/generate-pdf', async (req, res, next) => {
  try {
    const { briefData } = req.body;
    
    if (!briefData || !briefData.keyword) {
      return res.status(400).json({ error: 'Les données du brief sont requises' });
    }
    
    console.log(`Génération PDF pour le mot-clé: "${briefData.keyword}"`);
    
    // Générer le PDF
    const pdfBuffer = await pdfService.generatePdf(briefData);
    
    // Définir les en-têtes pour le téléchargement
    const filename = `brief-seo-${briefData.keyword.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Envoyer le PDF en tant que buffer
    res.end(pdfBuffer, 'binary');
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    next(error);
  }
});

module.exports = router;

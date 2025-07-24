const puppeteer = require('puppeteer');

/**
 * Service pour la génération de PDF
 */
const pdfService = {
  /**
   * Échappe les caractères HTML pour éviter les erreurs
   * @param {string} text - Le texte à échapper
   * @returns {string} - Le texte échappé
   */
  escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Génère un PDF à partir des données du brief
   * @param {Object} briefData - Les données du brief
   * @returns {Promise<Buffer>} - Le buffer du PDF généré
   */
  async generatePdf(briefData) {
    let browser = null;
    
    try {
      console.log('Démarrage de la génération PDF...');
      
      // Lancer Puppeteer avec des options plus robustes
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Générer le contenu HTML simplifié
      const htmlContent = this.generateSimpleHtmlContent(briefData);
      
      // Log pour débugger
      console.log('HTML Content length:', htmlContent.length);
      
      // Définir le contenu de la page
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Générer le PDF avec des options simplifiées
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: false // Désactivé pour éviter les problèmes
      });
      
      console.log('PDF généré avec succès, taille:', pdfBuffer.length, 'bytes');
      return pdfBuffer;
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error(`Erreur de génération PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },

  /**
   * Génère un contenu HTML simplifié pour éviter les erreurs
   * @param {Object} briefData - Les données du brief
   * @returns {string} - Le contenu HTML
   */
  generateSimpleHtmlContent(briefData) {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Brief SEO - ${this.escapeHtml(briefData.keyword)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            font-size: 12pt;
          }
          
          h1 {
            color: #1e40af;
            font-size: 24pt;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 10px;
          }
          
          h2 {
            color: #1e40af;
            font-size: 18pt;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          h3 {
            color: #374151;
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          
          p {
            margin-bottom: 10px;
            text-align: justify;
          }
          
          ul {
            margin-left: 20px;
            margin-bottom: 15px;
          }
          
          li {
            margin-bottom: 5px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          
          .keyword {
            font-size: 20pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          
          .date {
            color: #64748b;
            font-size: 11pt;
          }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .tag {
            display: inline-block;
            padding: 4px 8px;
            margin: 2px 4px 2px 0;
            border-radius: 4px;
            font-size: 10pt;
            font-weight: 500;
            background-color: #e5e7eb;
            color: #374151;
          }
          
          .tag-blue {
            background-color: #dbeafe;
            color: #1e40af;
          }
          
          .tag-green {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          .info-box {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 4px 4px 0;
          }
          
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="keyword">${this.escapeHtml(briefData.keyword)}</div>
          <div class="date">Brief généré le ${currentDate}</div>
          ${briefData.location ? `<div class="date">Localisation: ${this.escapeHtml(briefData.location)}</div>` : ''}
        </div>
        
        ${this.generateSimpleSemanticSection(briefData)}
        ${this.generateSimpleContentPlanSection(briefData)}
        ${this.generateSimpleContentAnalysisSection(briefData)}
        ${this.generateSimpleSeoMetadataSection(briefData)}
      </body>
      </html>
    `;
  },

  /**
   * Génère la section sémantique simplifiée
   */
  generateSimpleSemanticSection(briefData) {
    if (!briefData.semanticData) return '';
    
    const semanticData = briefData.semanticData;
    let html = '<div class="section"><h2>Analyse Sémantique</h2>';
    
    // Informations générales
    if (semanticData.target_seo_score || semanticData.recommended_words) {
      html += '<div class="info-box">';
      if (semanticData.target_seo_score) {
        html += `<p><strong>Score SEO cible :</strong> ${semanticData.target_seo_score}</p>`;
      }
      if (semanticData.recommended_words) {
        html += `<p><strong>Nombre de mots recommandé :</strong> ${semanticData.recommended_words}</p>`;
      }
      html += '</div>';
    }
    
    // Mots-clés obligatoires
    if (semanticData.KW_obligatoires && semanticData.KW_obligatoires.length > 0) {
      html += '<h3>Mots-clés obligatoires</h3><p>';
             semanticData.KW_obligatoires.forEach((kw, index) => {
         if (index > 0) html += ', ';
         html += `<span class="tag tag-blue">${this.escapeHtml(kw.mot)}</span>`;
       });
      html += '</p>';
    }
    
    // Mots-clés complémentaires
    if (semanticData.KW_complementaires && semanticData.KW_complementaires.length > 0) {
      html += '<h3>Mots-clés complémentaires</h3><p>';
             semanticData.KW_complementaires.forEach((kw, index) => {
         if (index > 0) html += ', ';
         html += `<span class="tag tag-green">${this.escapeHtml(kw.mot)}</span>`;
       });
      html += '</p>';
    }
    
    html += '</div>';
    return html;
  },

  /**
   * Génère la section du plan de contenu simplifiée
   */
  generateSimpleContentPlanSection(briefData) {
    if (!briefData.contentPlan) return '';
    
    const plan = briefData.contentPlan;
    let html = '<div class="section page-break"><h2>Plan de Contenu</h2>';
    
    // Objectif du contenu
    if (plan.contentObjective) {
      html += `<div class="info-box">
        <h3>Objectif du contenu</h3>
        <p>${this.escapeHtml(plan.contentObjective)}</p>
      </div>`;
    }
    
    // Objectifs
    if (plan.objectives && plan.objectives.length > 0) {
      html += '<h3>Objectifs</h3><ul>';
      plan.objectives.forEach(objective => {
        html += `<li>${this.escapeHtml(objective)}</li>`;
      });
      html += '</ul>';
    }
    
    // Structure du contenu
    if (plan.sections && plan.sections.length > 0) {
      html += '<h3>Structure du contenu</h3>';
      plan.sections.forEach(section => {
        html += `<h4>${this.escapeHtml(section.title)}</h4>`;
        if (section.subsections && section.subsections.length > 0) {
          html += '<ul>';
          section.subsections.forEach(subsection => {
            html += `<li>${this.escapeHtml(subsection)}</li>`;
          });
          html += '</ul>';
        }
      });
    }
    
    html += '</div>';
    return html;
  },

  /**
   * Génère la section d'analyse de contenu simplifiée
   */
  generateSimpleContentAnalysisSection(briefData) {
    if (!briefData.contentAnalysis) return '';
    
    const analysis = briefData.contentAnalysis;
    let html = '<div class="section page-break"><h2>Analyse de Contenu</h2>';
    
    // Contexte
    if (analysis.context && analysis.context.primaryIntent) {
      html += `<h3>Intention principale</h3>
        <p>${this.escapeHtml(analysis.context.primaryIntent)}</p>`;
    }
    
    // Sujets principaux
    if (analysis.mainTopics && analysis.mainTopics.essentialTopics && analysis.mainTopics.essentialTopics.length > 0) {
      html += '<h3>Sujets essentiels</h3><ul>';
      analysis.mainTopics.essentialTopics.forEach(topic => {
        html += `<li>${this.escapeHtml(topic)}</li>`;
      });
      html += '</ul>';
    }
    
    html += '</div>';
    return html;
  },

  /**
   * Génère la section des métadonnées SEO simplifiée
   */
  generateSimpleSeoMetadataSection(briefData) {
    if (!briefData.seoMetadata) return '';
    
    const metadata = briefData.seoMetadata;
    let html = '<div class="section"><h2>Métadonnées SEO</h2>';
    
    if (metadata.title) {
      html += `<h3>Titre SEO</h3>
        <p><strong>${this.escapeHtml(metadata.title)}</strong></p>
        <p><em>Longueur : ${metadata.title.length} caractères</em></p>`;
    }
    
    if (metadata.description) {
      html += `<h3>Meta Description</h3>
        <p>${this.escapeHtml(metadata.description)}</p>
        <p><em>Longueur : ${metadata.description.length} caractères</em></p>`;
    }
    
    html += '</div>';
    return html;
  }
};

module.exports = pdfService; 
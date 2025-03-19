/**
 * Gestion de l'interface utilisateur
 */
const ui = {
    /**
     * Éléments du DOM
     */
    elements: {
        keywordForm: null,
        keywordInput: null,
        customPromptInput: null,
        errorMessage: null,
        loadingIndicator: null,
        briefResult: null
    },
    
    /**
     * Initialise les éléments du DOM
     */
    init() {
        this.elements.keywordForm = document.getElementById('keywordForm');
        this.elements.keywordInput = document.getElementById('keyword');
        this.elements.customPromptInput = document.getElementById('customPrompt');
        this.elements.errorMessage = document.getElementById('errorMessage');
        this.elements.loadingIndicator = document.getElementById('loadingIndicator');
        this.elements.briefResult = document.getElementById('briefResult');
    },
    
    /**
     * Affiche un message d'erreur
     * @param {string} message - Le message d'erreur à afficher
     */
    showError(message) {
        this.elements.errorMessage.querySelector('p').textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    },
    
    /**
     * Cache le message d'erreur
     */
    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    },
    
    /**
     * Affiche l'indicateur de chargement
     */
    showLoading() {
        this.elements.loadingIndicator.classList.remove('hidden');
    },
    
    /**
     * Cache l'indicateur de chargement
     */
    hideLoading() {
        this.elements.loadingIndicator.classList.add('hidden');
    },
    
    /**
     * Affiche le résultat du brief
     * @param {Object} briefData - Les données du brief
     */
    showBriefResult(briefData) {
        // Vider le conteneur
        this.elements.briefResult.innerHTML = '';
        
        // Créer les sections du brief
        const briefContent = document.createElement('div');
        briefContent.className = 'space-y-8';
        
        // En-tête du brief
        briefContent.appendChild(this.createBriefHeader(briefData));
        
        // Mots-clés
        briefContent.appendChild(this.createKeywordsSection(briefData));
        
        // Plan de contenu
        briefContent.appendChild(this.createContentPlanSection(briefData));
        
        // Analyse de contenu
        briefContent.appendChild(this.createContentAnalysisSection(briefData));
        
        // Métadonnées SEO
        briefContent.appendChild(this.createSeoMetadataSection(briefData));
        
        // Bouton d'export PDF
        const exportButton = document.createElement('button');
        exportButton.className = 'mt-8 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
        exportButton.textContent = 'Exporter en PDF';
        exportButton.addEventListener('click', () => {
            this.exportToPdf(briefData);
        });
        briefContent.appendChild(exportButton);
        
        // Ajouter le contenu au résultat
        this.elements.briefResult.appendChild(briefContent);
        this.elements.briefResult.classList.remove('hidden');
    },
    
    /**
     * Crée l'en-tête du brief
     * @param {Object} briefData - Les données du brief
     * @returns {HTMLElement} - L'élément HTML de l'en-tête
     */
    createBriefHeader(briefData) {
        const header = document.createElement('div');
        header.className = 'bg-white p-6 rounded-lg shadow';
        
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold text-gray-800 mb-4';
        title.textContent = `Brief SEO : ${briefData.keyword}`;
        
        const info = document.createElement('p');
        info.className = 'text-gray-600';
        info.textContent = `Nombre de mots recommandé : ${briefData.thotSeoData.mots_requis || 'Non spécifié'}`;
        
        header.appendChild(title);
        header.appendChild(info);
        
        return header;
    },
    
    /**
     * Crée la section des mots-clés
     * @param {Object} briefData - Les données du brief
     * @returns {HTMLElement} - L'élément HTML de la section
     */
    createKeywordsSection(briefData) {
        const section = document.createElement('div');
        section.className = 'bg-white p-6 rounded-lg shadow';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-gray-800 mb-4';
        title.textContent = 'Mots-clés';
        
        section.appendChild(title);
        
        // Mots-clés obligatoires
        if (briefData.thotSeoData.KW_obligatoires && briefData.thotSeoData.KW_obligatoires.length > 0) {
            const obligatoiresTitle = document.createElement('h4');
            obligatoiresTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            obligatoiresTitle.textContent = 'Mots-clés obligatoires';
            
            const obligatoiresList = document.createElement('div');
            obligatoiresList.className = 'flex flex-wrap';
            
            briefData.thotSeoData.KW_obligatoires.forEach(kw => {
                const tag = document.createElement('span');
                tag.className = 'tag tag-blue';
                tag.textContent = kw.mot;
                obligatoiresList.appendChild(tag);
            });
            
            section.appendChild(obligatoiresTitle);
            section.appendChild(obligatoiresList);
        }
        
        // Mots-clés complémentaires
        if (briefData.thotSeoData.KW_complementaires && briefData.thotSeoData.KW_complementaires.length > 0) {
            const complementairesTitle = document.createElement('h4');
            complementairesTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            complementairesTitle.textContent = 'Mots-clés complémentaires';
            
            const complementairesList = document.createElement('div');
            complementairesList.className = 'flex flex-wrap';
            
            briefData.thotSeoData.KW_complementaires.forEach(kw => {
                const tag = document.createElement('span');
                tag.className = 'tag tag-green';
                tag.textContent = kw.mot;
                complementairesList.appendChild(tag);
            });
            
            section.appendChild(complementairesTitle);
            section.appendChild(complementairesList);
        }
        
        // Questions fréquentes
        if (briefData.thotSeoData.questions && briefData.thotSeoData.questions.length > 0) {
            const questionsTitle = document.createElement('h4');
            questionsTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            questionsTitle.textContent = 'Questions fréquentes';
            
            const questionsList = document.createElement('ul');
            questionsList.className = 'list-disc pl-5 space-y-1 text-gray-700';
            
            briefData.thotSeoData.questions.forEach(question => {
                const item = document.createElement('li');
                item.textContent = question;
                questionsList.appendChild(item);
            });
            
            section.appendChild(questionsTitle);
            section.appendChild(questionsList);
        }
        
        return section;
    },
    
    /**
     * Crée la section du plan de contenu
     * @param {Object} briefData - Les données du brief
     * @returns {HTMLElement} - L'élément HTML de la section
     */
    createContentPlanSection(briefData) {
        const section = document.createElement('div');
        section.className = 'bg-white p-6 rounded-lg shadow';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-gray-800 mb-4';
        title.textContent = 'Plan de contenu';
        
        section.appendChild(title);
        
        // Objectif principal du contenu
        if (briefData.contentPlan.contentObjective) {
            const objectiveTitle = document.createElement('h4');
            objectiveTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            objectiveTitle.textContent = 'Objectif du contenu';
            
            const objectiveText = document.createElement('p');
            objectiveText.className = 'text-gray-700 mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded';
            objectiveText.textContent = briefData.contentPlan.contentObjective;
            
            section.appendChild(objectiveTitle);
            section.appendChild(objectiveText);
        }
        
        // Objectifs
        if (briefData.contentPlan.objectives && briefData.contentPlan.objectives.length > 0) {
            const objectivesTitle = document.createElement('h4');
            objectivesTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            objectivesTitle.textContent = 'Objectifs';
            
            const objectivesList = document.createElement('ul');
            objectivesList.className = 'list-disc pl-5 space-y-1 text-gray-700';
            
            briefData.contentPlan.objectives.forEach(objective => {
                const item = document.createElement('li');
                item.textContent = objective;
                objectivesList.appendChild(item);
            });
            
            section.appendChild(objectivesTitle);
            section.appendChild(objectivesList);
        }
        
        // Style et ton
        if ((briefData.contentPlan.tone && briefData.contentPlan.tone.length > 0) || 
            (briefData.contentPlan.style && briefData.contentPlan.style.length > 0)) {
            const styleTitle = document.createElement('h4');
            styleTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            styleTitle.textContent = 'Style et ton';
            
            const styleList = document.createElement('div');
            styleList.className = 'flex flex-wrap';
            
            if (briefData.contentPlan.tone) {
                briefData.contentPlan.tone.forEach(tone => {
                    const tag = document.createElement('span');
                    tag.className = 'tag tag-purple';
                    tag.textContent = tone;
                    styleList.appendChild(tag);
                });
            }
            
            if (briefData.contentPlan.style) {
                briefData.contentPlan.style.forEach(style => {
                    const tag = document.createElement('span');
                    tag.className = 'tag tag-orange';
                    tag.textContent = style;
                    styleList.appendChild(tag);
                });
            }
            
            section.appendChild(styleTitle);
            section.appendChild(styleList);
        }
        
        // Sections
        if (briefData.contentPlan.sections && briefData.contentPlan.sections.length > 0) {
            const sectionsTitle = document.createElement('h4');
            sectionsTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            sectionsTitle.textContent = 'Structure du contenu';
            
            const sectionsList = document.createElement('div');
            sectionsList.className = 'space-y-4 mt-2';
            
            briefData.contentPlan.sections.forEach((section, index) => {
                const sectionCard = document.createElement('div');
                sectionCard.className = 'section-card bg-gray-50 p-4 rounded-md border border-gray-200';
                
                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'font-medium text-gray-800 mb-2 p-2 bg-gray-200 rounded';
                sectionTitle.innerHTML = `<code>&lt;H2&gt;</code> ${section.title}`;
                
                const subsectionsList = document.createElement('div');
                subsectionsList.className = 'mt-2 space-y-3';
                
                section.subsections.forEach(subsection => {
                    // Vérifier si le sous-titre contient des indications de H3
                    const hasH3 = subsection.includes('[H3]') || subsection.includes('(H3)');
                    
                    const subsectionItem = document.createElement('div');
                    subsectionItem.className = 'ml-4 font-normal text-gray-600 p-2 bg-gray-50 rounded';
                    subsectionItem.innerHTML = `<code>&lt;H3&gt;</code> ${hasH3 ? subsection.replace(/\[H3\]|\(H3\)/, '').trim() : subsection}`;
                    
                    subsectionsList.appendChild(subsectionItem);
                });
                
                sectionCard.appendChild(sectionTitle);
                sectionCard.appendChild(subsectionsList);
                sectionsList.appendChild(sectionCard);
            });
            
            section.appendChild(sectionsTitle);
            section.appendChild(sectionsList);
        }
        
        return section;
    },
    
    /**
     * Crée la section d'analyse de contenu
     * @param {Object} briefData - Les données du brief
     * @returns {HTMLElement} - L'élément HTML de la section
     */
    createContentAnalysisSection(briefData) {
        const section = document.createElement('div');
        section.className = 'bg-white p-6 rounded-lg shadow';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-gray-800 mb-4';
        title.textContent = 'Analyse de contenu';
        
        section.appendChild(title);
        
        // Intention principale
        if (briefData.contentAnalysis.context && briefData.contentAnalysis.context.primaryIntent) {
            const intentTitle = document.createElement('h4');
            intentTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            intentTitle.textContent = 'Intention principale';
            
            const intentText = document.createElement('p');
            intentText.className = 'text-gray-700';
            intentText.textContent = briefData.contentAnalysis.context.primaryIntent;
            
            section.appendChild(intentTitle);
            section.appendChild(intentText);
        }
        
        // Sujets essentiels
        if (briefData.contentAnalysis.mainTopics && briefData.contentAnalysis.mainTopics.essentialTopics && 
            briefData.contentAnalysis.mainTopics.essentialTopics.length > 0) {
            const topicsTitle = document.createElement('h4');
            topicsTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            topicsTitle.textContent = 'Sujets essentiels';
            
            const topicsList = document.createElement('ul');
            topicsList.className = 'list-disc pl-5 space-y-1 text-gray-700';
            
            briefData.contentAnalysis.mainTopics.essentialTopics.forEach(topic => {
                const item = document.createElement('li');
                item.textContent = topic;
                topicsList.appendChild(item);
            });
            
            section.appendChild(topicsTitle);
            section.appendChild(topicsList);
        }
        
        // Questions clés
        if (briefData.contentAnalysis.mainTopics && briefData.contentAnalysis.mainTopics.keyQuestions && 
            briefData.contentAnalysis.mainTopics.keyQuestions.length > 0) {
            const questionsTitle = document.createElement('h4');
            questionsTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            questionsTitle.textContent = 'Questions clés';
            
            const questionsList = document.createElement('ul');
            questionsList.className = 'list-disc pl-5 space-y-1 text-gray-700';
            
            briefData.contentAnalysis.mainTopics.keyQuestions.forEach(question => {
                const item = document.createElement('li');
                item.textContent = question;
                questionsList.appendChild(item);
            });
            
            section.appendChild(questionsTitle);
            section.appendChild(questionsList);
        }
        
        // Proposition de valeur
        if (briefData.contentAnalysis.valueProposition) {
            const valueTitle = document.createElement('h4');
            valueTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            valueTitle.textContent = 'Proposition de valeur';
            
            const valueText = document.createElement('p');
            valueText.className = 'text-gray-700';
            valueText.textContent = briefData.contentAnalysis.valueProposition;
            
            section.appendChild(valueTitle);
            section.appendChild(valueText);
        }
        
        return section;
    },
    
    /**
     * Crée la section des métadonnées SEO
     * @param {Object} briefData - Les données du brief
     * @returns {HTMLElement} - L'élément HTML de la section
     */
    createSeoMetadataSection(briefData) {
        const section = document.createElement('div');
        section.className = 'bg-white p-6 rounded-lg shadow';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-gray-800 mb-4';
        title.textContent = 'Métadonnées SEO';
        
        section.appendChild(title);
        
        // Slug
        if (briefData.seoMetadata.slug) {
            const slugTitle = document.createElement('h4');
            slugTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            slugTitle.textContent = 'Slug URL';
            
            const slugText = document.createElement('code');
            slugText.className = 'block p-2 bg-gray-100 rounded text-gray-800 font-mono text-sm';
            slugText.textContent = briefData.seoMetadata.slug;
            
            section.appendChild(slugTitle);
            section.appendChild(slugText);
        }
        
        // Title
        if (briefData.seoMetadata.title) {
            const titleTitle = document.createElement('h4');
            titleTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            titleTitle.textContent = 'Title tag';
            
            const titleText = document.createElement('p');
            titleText.className = 'p-2 bg-gray-100 rounded text-gray-800';
            titleText.textContent = briefData.seoMetadata.title;
            
            const titleLength = document.createElement('p');
            titleLength.className = 'text-xs text-gray-500 mt-1';
            titleLength.textContent = `${briefData.seoMetadata.title.length} caractères (recommandé: 50-60)`;
            
            section.appendChild(titleTitle);
            section.appendChild(titleText);
            section.appendChild(titleLength);
        }
        
        // Meta description
        if (briefData.seoMetadata.metaDescription) {
            const descTitle = document.createElement('h4');
            descTitle.className = 'text-lg font-semibold text-gray-700 mt-4 mb-2';
            descTitle.textContent = 'Meta description';
            
            const descText = document.createElement('p');
            descText.className = 'p-2 bg-gray-100 rounded text-gray-800';
            descText.textContent = briefData.seoMetadata.metaDescription;
            
            const descLength = document.createElement('p');
            descLength.className = 'text-xs text-gray-500 mt-1';
            descLength.textContent = `${briefData.seoMetadata.metaDescription.length} caractères (recommandé: 150-160)`;
            
            section.appendChild(descTitle);
            section.appendChild(descText);
            section.appendChild(descLength);
        }
        
        return section;
    },
    
    /**
     * Exporte le brief en PDF
     * @param {Object} briefData - Les données du brief
     */
    exportToPdf(briefData) {
        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
            alert("Veuillez autoriser les popups pour permettre l'impression");
            return;
        }
        
        // Récupérer le contenu du brief
        const briefContent = this.elements.briefResult.cloneNode(true);
        
        // Supprimer le bouton d'export du clone
        const exportButtons = briefContent.querySelectorAll('button');
        exportButtons.forEach(button => button.remove());
        
        // Créer le contenu HTML de la fenêtre d'impression
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Brief SEO - ${briefData.keyword}</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    
                    h1, h2, h3, h4 {
                        color: #2c3e50;
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    
                    h1 {
                        font-size: 24px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                    }
                    
                    h2 {
                        font-size: 20px;
                    }
                    
                    h3 {
                        font-size: 18px;
                    }
                    
                    h4 {
                        font-size: 16px;
                    }
                    
                    .section {
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    
                    .tag {
                        display: inline-block;
                        padding: 3px 8px;
                        margin: 2px;
                        border-radius: 3px;
                        font-size: 12px;
                    }
                    
                    .tag-blue {
                        background-color: #e3f2fd;
                        color: #0d47a1;
                    }
                    
                    .tag-green {
                        background-color: #e8f5e9;
                        color: #1b5e20;
                    }
                    
                    .tag-purple {
                        background-color: #f3e5f5;
                        color: #4a148c;
                    }
                    
                    .tag-orange {
                        background-color: #fff3e0;
                        color: #e65100;
                    }
                    
                    .tag-red {
                        background-color: #ffebee;
                        color: #b71c1c;
                    }
                    
                    .section-card {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 15px;
                    }
                    
                    code {
                        background-color: #f1f1f1;
                        padding: 2px 5px;
                        border-radius: 3px;
                        font-family: monospace;
                    }
                    
                    @media print {
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        
                        body {
                            font-size: 12pt;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${briefContent.innerHTML}
            </body>
            </html>
        `;
        
        // Écrire le contenu dans la nouvelle fenêtre
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Attendre que le contenu soit chargé avant d'imprimer
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                // Fermer la fenêtre après l'impression (optionnel)
                // printWindow.close();
            }, 500);
        };
    }
};

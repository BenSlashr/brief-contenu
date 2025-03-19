/**
 * Script principal de l'application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'interface utilisateur
    ui.init();
    
    // Gérer la soumission du formulaire
    ui.elements.keywordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const keyword = ui.elements.keywordInput.value.trim();
        const customPrompt = ui.elements.customPromptInput.value.trim();
        
        // Valider les entrées
        if (!keyword) {
            ui.showError('Veuillez entrer un mot-clé');
            return;
        }
        
        // Réinitialiser l'interface
        ui.hideError();
        ui.elements.briefResult.classList.add('hidden');
        ui.showLoading();
        
        try {
            console.log(`Génération du brief pour le mot-clé: "${keyword}"`);
            
            // Générer le brief complet
            const briefData = await api.generateBrief(keyword, customPrompt);
            
            // Afficher le résultat
            ui.showBriefResult(briefData);
        } catch (error) {
            console.error('Erreur lors de la génération du brief:', error);
            ui.showError(error.message || 'Une erreur est survenue lors de la génération du brief');
        } finally {
            ui.hideLoading();
        }
    });
    
    // Ajouter des exemples de mots-clés pour faciliter les tests
    const exampleKeywords = [
        'recette gâteau chocolat',
        'meilleur vpn 2025',
        'comment perdre du poids',
        'voyage japon pas cher',
        'comparatif smartphones'
    ];
    
    // Créer la section d'exemples
    const examplesSection = document.createElement('div');
    examplesSection.className = 'max-w-2xl mx-auto mt-4 text-center';
    examplesSection.innerHTML = '<p class="text-sm text-gray-500 mb-2">Exemples de mots-clés :</p>';
    
    const examplesList = document.createElement('div');
    examplesList.className = 'flex flex-wrap justify-center gap-2';
    
    exampleKeywords.forEach(keyword => {
        const button = document.createElement('button');
        button.className = 'text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded';
        button.textContent = keyword;
        button.addEventListener('click', () => {
            ui.elements.keywordInput.value = keyword;
        });
        examplesList.appendChild(button);
    });
    
    examplesSection.appendChild(examplesList);
    
    // Insérer la section d'exemples après le formulaire
    ui.elements.keywordForm.parentNode.insertBefore(examplesSection, ui.elements.keywordForm.nextSibling);
});

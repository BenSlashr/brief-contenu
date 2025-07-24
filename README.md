# Brief Generator Web

Une application web pour générer des briefs SEO détaillés à partir d'un mot-clé. Cette application utilise Node.js pour le backend et HTML/CSS/JavaScript pour le frontend.

## Fonctionnalités

- Génération de briefs SEO complets à partir d'un mot-clé
- Analyse sémantique avancée via l'API SlashR
- Analyse de la structure des titres du top 10 SERP via ValueSERP
- Génération de contenu avec OpenAI intégrant l'analyse concurrentielle
- Interface utilisateur intuitive et responsive
- Export des briefs en PDF
- Objectif de contenu généré automatiquement
- Structure hiérarchique claire avec balises H2 et H3
- Score SEO cible et recommandations de longueur

## Prérequis

- Node.js 18.0.0 ou supérieur
- Clé API OpenAI
- Accès à l'API sémantique SlashR (https://outils.agence-slashr.fr/semantique/api/v1)
- Clé API ValueSERP (https://www.valueserp.com/)

## Installation

1. Cloner le dépôt ou télécharger les fichiers
```bash
git clone https://github.com/BenSlashr/brief-contenu.git
cd brief-contenu
```

2. Installer les dépendances
```bash
npm install
```

3. Créer un fichier `.env` à partir du fichier `.env.example`
```bash
cp .env.example .env
```

4. Configurer les variables d'environnement dans le fichier `.env`
```
PORT=3000
SEMANTIC_API_URL=https://outils.agence-slashr.fr/semantique/api/v1
SEMANTIC_LOCATION=France
SEMANTIC_TIMEOUT=30000
VALUESERP_API_KEY=votre_cle_api_valueserp
OPENAI_API_KEY=votre_cle_api_openai
```

## Démarrage de l'application

### En développement
```bash
npm run dev
```

### En production
```bash
npm start
```

L'application sera accessible à l'adresse http://localhost:3000 (ou le port que vous avez configuré).

## Déploiement sur un VPS

### Prérequis
- Un VPS avec Ubuntu 20.04 ou supérieur
- Node.js 18.0.0 ou supérieur installé
- Nginx (recommandé pour servir l'application)
- PM2 (pour gérer le processus Node.js)

### Étapes de déploiement

1. Installer Node.js sur votre VPS
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Installer PM2 globalement
```bash
sudo npm install -g pm2
```

3. Installer Nginx
```bash
sudo apt-get install nginx
```

4. Cloner le dépôt sur votre VPS
```bash
git clone https://github.com/BenSlashr/brief-contenu.git
```

5. Configurer l'application
```bash
cd brief-contenu
npm install
cp .env.example .env
# Modifier le fichier .env avec vos clés API
```

6. Configurer PM2 pour démarrer l'application
```bash
pm2 start server/server.js --name "brief-generator"
pm2 save
pm2 startup
```

## Nouvelles fonctionnalités (Mars 2025)

- **Objectif de contenu** : Un objectif de contenu est maintenant généré automatiquement par OpenAI et affiché au début du brief
- **Structure hiérarchique améliorée** : Le plan de contenu est maintenant formaté avec des balises HTML (H2, H3) pour aider les rédacteurs à comprendre la structure hiérarchique
- **Export PDF optimisé** : L'export PDF a été amélioré pour n'inclure que les résultats de l'analyse, avec une mise en page propre et lisible

## Licence

Ce projet est sous licence ISC.

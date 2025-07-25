const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes/api');

// Initialisation de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes API avec basePath
app.use(`${config.basePath}/api`, apiRoutes);

// Servir les fichiers statiques avec basePath
app.use(config.basePath, express.static(path.join(__dirname, '../public')));

// Route pour toutes les autres requêtes (SPA) avec basePath
app.get(`${config.basePath}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Redirection de la racine vers le basePath si nécessaire
if (config.basePath !== '') {
  app.get('/', (req, res) => {
    res.redirect(config.basePath);
  });
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Une erreur est survenue',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
  });
});

// Démarrage du serveur
app.listen(config.port, () => {
  console.log(`Serveur démarré sur le port ${config.port}`);
  console.log(`http://localhost:${config.port}`);
});

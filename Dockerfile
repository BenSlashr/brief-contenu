# Utiliser une image Node.js officielle
FROM node:18-alpine

# Installer les dépendances système nécessaires pour Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Dire à Puppeteer d'utiliser le Chromium installé
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copier le reste du projet
COPY --chown=nextjs:nodejs . .

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port de l'application
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV BASE_PATH=/brief-contenu

# Lancer l'application
CMD ["npm", "start"]

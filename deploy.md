# Guide de Déploiement - Brief Contenu

## 🚀 Déploiement Docker sur VPS

### 1. Prérequis sur le VPS

```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session pour appliquer les groupes
logout
```

### 2. Cloner et Configurer le Projet

```bash
# Cloner le projet
git clone https://github.com/votre-repo/brief-contenu.git
cd brief-contenu

# Créer le fichier .env
cp .env.example .env
nano .env
```

### 3. Configuration .env

```env
PORT=3000
BASE_PATH=/brief-contenu

# APIs
SEMANTIC_API_URL=https://outils.agence-slashr.fr/semantique/api/v1
SEMANTIC_LOCATION=France
SEMANTIC_TIMEOUT=30000
VALUESERP_API_KEY=votre_cle_valueserp
OPENAI_API_KEY=votre_cle_openai

# Production
NODE_ENV=production
```

### 4. Build et Lancement

```bash
# Build l'image Docker
docker-compose build

# Lancer l'application
docker-compose up -d

# Vérifier le statut
docker-compose ps
docker-compose logs -f brief-contenu
```

### 5. Configuration Nginx

```bash
# Copier la configuration Nginx
sudo cp nginx.conf /etc/nginx/sites-available/brief-contenu
sudo ln -s /etc/nginx/sites-available/brief-contenu /etc/nginx/sites-enabled/

# Modifier le server_name dans nginx.conf
sudo nano /etc/nginx/sites-available/brief-contenu

# Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Accès à l'Application

L'application sera accessible à :
- `http://votre-domaine.com/brief-contenu/`
- `http://votre-ip:3000/brief-contenu/` (accès direct)

## 🔧 Commandes Utiles

### Gestion Docker

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer l'application
docker-compose restart

# Mettre à jour l'application
git pull
docker-compose build
docker-compose up -d

# Arrêter l'application
docker-compose down
```

### Monitoring

```bash
# Vérifier la santé du container
docker-compose ps

# Voir l'utilisation des ressources
docker stats brief-contenu-app

# Accéder au container
docker-compose exec brief-contenu sh
```

## 🔒 Sécurité

### Firewall

```bash
# Configurer UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Auto-renouvellement
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 Dépannage

### Problèmes Courants

1. **Application inaccessible**
   ```bash
   # Vérifier les ports
   sudo netstat -tlnp | grep :3000
   
   # Vérifier Nginx
   sudo nginx -t
   sudo systemctl status nginx
   ```

2. **Erreurs de génération PDF**
   ```bash
   # Vérifier les dépendances Chromium
   docker-compose exec brief-contenu chromium-browser --version
   ```

3. **Problèmes d'API**
   ```bash
   # Vérifier les variables d'environnement
   docker-compose exec brief-contenu env | grep API
   ```

### Logs

```bash
# Logs de l'application
docker-compose logs brief-contenu

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 📊 Maintenance

### Sauvegarde

```bash
# Créer un script de sauvegarde
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec brief-contenu tar czf - /app > backup_brief_$DATE.tar.gz
```

### Mise à jour

```bash
#!/bin/bash
# Script de mise à jour automatique
git pull
docker-compose build --no-cache
docker-compose down
docker-compose up -d
``` 
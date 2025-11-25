# FRANCHISE MANAGER - Application de Gestion de Franchises

## Description
Application web fullstack développée pour la gestion centralisée d'un réseau de franchises. Cette solution digitalise l'ensemble du processus de gestion des franchisés, du parc matériel et des relations commerciales entre franchiseur et franchisés.

## Contexte du Projet
Solution complète de gestion franchisée répondant aux besoins des entreprises développant un réseau de franchises. L'application modernise les processus métier et remplace les systèmes obsolètes type feuilles de calcul Excel.

## Fonctionnalités Principales

### Gestion des Franchisés
- Enregistrement et suivi des franchisés
- Gestion des contrats et droits d'entrée
- Profils détaillés avec informations commerciales
- Workflow de validation des candidatures

### Gestion du Parc Matériel
- Attribution et suivi des équipements aux franchisés
- Gestion des déploiements et affectations
- Suivi maintenance (pannes, entretien, carnets techniques)
- Planning d'intervention et de réparations

### Gestion Commerciale et Stocks
- Suivi du chiffre d'affaires et calcul des redevances (4%)
- Contrôle des approvisionnements (ratio 80/20 imposé/libre)
- Gestion multi-entrepôts avec localisation
- Analyse des performances et historiques de vente

### Reporting et Espaces Utilisateurs
- Génération automatique de rapports PDF (ventes, performances)
- Back-office administrateur pour la gestion globale
- Front-office franchisés pour la gestion quotidienne
- Tableaux de bord personnalisés par profil

## Architecture Technique

### Backend
- **Framework** : Django + Django REST Framework
- **Base de données** : PostgreSQL
- **Authentification** : JWT
- **API** : RESTful API complète

### Frontend
- **Framework** : React
- **Gestion d'état** : Zustand
- **Routing** : React Router DOM
- **HTTP Client** : Axios

## Installation et Déploiement

### Prérequis
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Installation Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Installation Frontend
```bash
cd frontend
npm install
npm run dev
```

## Structure du Projet
```
franchise-manager/
├── backend/          # API Django - Gestion données métier
├── frontend/         # Application React - Interfaces utilisateurs
```

## Objectifs Atteints
- Digitalisation complète de la gestion franchisée
- Automatisation des processus manuels
- Interface adaptée aux différents profils (admin/franchisés)
- Solution scalable pour l'expansion du réseau
- Génération automatisée des rapports réglementaires

## Technologies Utilisées
- Python, Django, Django REST Framework
- JavaScript, React, Zustand, React Router
- PostgreSQL, Axios
- Génération PDF, JWT Authentication
- Configuration serveur web

## Auteur
Mamadou Lamarana Diallo  
Développeur Fullstack - Recherche alternance

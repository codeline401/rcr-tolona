# RCR — Plateforme de Gestion

Application web de gestion de l'organisation RCR (membres, cotisations, finances, votes, blog, activités).

> Réécriture complète du projet Django original en **React + Node.js**.

---

## Stack Technique

| Couche          | Technologie                    | Rôle                        |
| --------------- | ------------------------------ | --------------------------- |
| Frontend        | React 18 + Vite + TypeScript   | Interface utilisateur       |
| Styling         | TailwindCSS                    | Design système              |
| State / Data    | React Query + Zustand          | Cache serveur + état global |
| Formulaires     | React Hook Form + Zod          | Formulaires et validation   |
| Routing         | React Router v6                | Navigation SPA              |
| Backend         | Node.js + Express + TypeScript | API REST                    |
| ORM             | Prisma                         | Accès base de données       |
| Base de données | PostgreSQL 16                  | Stockage principal          |
| Auth            | JWT + bcryptjs                 | Authentification            |
| Upload          | Multer                         | Gestion des fichiers        |
| DevOps          | Docker + Docker Compose        | Conteneurisation            |

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) >= 24
- [Git](https://git-scm.com/)

---

## Installation & Lancement

### 1. Cloner le projet

```bash
git clone https://github.com/TON_USERNAME/rcr-react.git
cd rcr-react
```

2. Backend

cd backend
cp .env.dist .env # copier le fichier d'environnement

# → renseigner les valeurs dans .env

npm install

# Lancer la base de données

docker compose -f docker-compose.dev.yml up -d

# Appliquer les migrations

npx prisma migrate dev

# Démarrer le serveur de développement

npm run dev

3. Frontend

cd frontend
cp .env.dist .env
npm install
npm run dev

4.Structure du Projet

rcr-react/
├── backend/ # API REST Node.js
│ ├── src/
│ │ ├── config/ # Configuration (Prisma, env)
│ │ ├── middlewares/ # Auth JWT, validation, upload
│ │ ├── modules/ # Modules métier
│ │ │ ├── auth/ # Authentification
│ │ │ ├── membre/ # Gestion des membres
│ │ │ ├── cotisation/ # Cotisations
│ │ │ ├── finance/ # Comptabilité
│ │ │ ├── blog/ # Articles
│ │ │ ├── voting/ # Système de vote
│ │ │ ├── activites/ # Activités
│ │ │ └── mada/ # Géographie Madagascar
│ │ ├── routes/ # Routeur central
│ │ └── utils/ # Helpers
│ └── prisma/
│ └── schema.prisma # Schéma de la base de données
│
├── frontend/ # Application React
│ └── src/
│ ├── api/ # Appels axios par module
│ ├── components/ # Composants réutilisables
│ ├── pages/ # Pages de l'application
│ ├── hooks/ # Hooks personnalisés
│ ├── store/ # État global (Zustand)
│ └── lib/ # Axios instance, utilitaires
│
├── ROADMAP.md
├── CONTRIBUTING.md
└── README.md

5. Module de l'application

Module Description
Auth Connexion, inscription, reset mot de passe
Membres Fiche membre, liste, matricule, photo
Cotisations Campagnes, types, paiement par tranches
Finance Caisses (centrale, district, diaspora), transactions
Blog Articles publiés, brouillons, illustration
Voting Élections, choix, votes, résultats
Activités Événements et activités de l'organisation
Mada Référentiel géographique (Province/Région/District/Commune/Fokontany)

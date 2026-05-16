# ROADMAP — RCR React

Suivi de l'avancement du projet.  
Légende : ✅ Terminé · 🔄 En cours · ⬜ À faire

---

## PHASE 1 — Infrastructure (Semaine 1)

- ✅ Initialisation du monorepo `rcr-react/`
- ✅ Configuration TypeScript backend
- ✅ Initialisation Prisma + connexion PostgreSQL
- ✅ Schéma Prisma complet (tous les modèles)
- ✅ Migration initiale de la base de données
- ✅ Serveur Express de base (app.ts + server.ts)
- ✅ Middleware d'authentification JWT
- ✅ Utilitaires de réponse API uniformes
- ✅ README + ROADMAP + CONTRIBUTING

---

## PHASE 2 — Backend API (Semaines 2-3)

### Module Auth

- ✅ `POST /api/auth/login` — Connexion
- ✅ `POST /api/auth/register` — Inscription
- ✅ `POST /api/auth/forgot-password` — Mot de passe oublié
- ✅ `POST /api/auth/reset-password` — Réinitialisation
- ✅ `GET  /api/auth/me` — Profil connecté

### Module Mada (référentiel géographique)

- ✅ `GET /api/mada/provinces`
- ✅ `GET /api/mada/regions`
- ✅ `GET /api/mada/districts`
- ✅ `GET /api/mada/communes`
- ✅ `GET /api/mada/fokontany`

### Module Membre

- ✅ `GET    /api/membres` — Liste (pagination + filtres)
- ✅ `POST   /api/membres` — Créer un membre
- ✅ `GET    /api/membres/:id` — Fiche membre
- ✅ `PATCH  /api/membres/:id` — Modifier
- ✅ `DELETE /api/membres/:id` — Supprimer
- ✅ Upload photo de profil

### Module Cotisation

- ✅ CRUD Campagnes
- ✅ CRUD Types de cotisation
- ✅ CRUD Cotisations par membre
- ✅ Gestion des tranches de paiement

### Module Finance

- ✅ CRUD Comptes financiers
- ✅ Enregistrer une transaction
- ✅ Historique des transactions par compte
- ✅ Tableau de bord financier (soldes)

### Module Blog

- ✅ CRUD Posts (avec upload illustration)
- ✅ Publication / dépublication
- ✅ Liste publique des articles publiés

### Module Voting

- ✅ CRUD Élections
- ✅ Ajouter des choix à une élection
- ✅ Voter (authentifié ou par token)
- ✅ Résultats d'une élection

### Module Activités

- ✅ CRUD Activités (avec upload illustration)
- ✅ Marquer terminée / annuler
- ✅ Gestion des étapes (Etape) avec validation de dates
- ✅ Gestion des postes budgétaires (PosteBudget)
- ✅ Contributions (identifiées ou anonymes)
- ✅ Routes publiques (liste + détail publique)
- ✅ Statistiques globales

---

## PHASE 3 — Frontend React (Semaines 4-6)

- ⬜ Initialisation Vite + React + TypeScript
- ⬜ Configuration TailwindCSS
- ⬜ Axios instance + intercepteurs
- ⬜ Store auth (Zustand)
- ⬜ Layout principal (Sidebar + Navbar)
- ⬜ Routing protégé (PrivateRoute)

### Pages

- ⬜ Login
- ⬜ Dashboard (KPIs)
- ⬜ Liste membres + filtres
- ⬜ Fiche membre
- ⬜ Formulaire création/édition membre
- ⬜ Cotisations
- ⬜ Finance
- ⬜ Blog (admin + public)
- ⬜ Voting
- ⬜ Activités

---

## PHASE 4 — Migration des données (Semaine 7)

- ⬜ Export depuis Django (`dumpdata`)
- ⬜ Script de migration Node.js
- ⬜ Import géographie (provinces, régions, districts...)
- ⬜ Import membres
- ⬜ Import cotisations
- ⬜ Import transactions

---

## PHASE 5 — Déploiement (Semaine 8)

- ⬜ Dockerfile backend
- ⬜ Dockerfile frontend
- ⬜ docker-compose.yml production
- ⬜ Configuration Nginx
- ⬜ Variables d'environnement production
- ⬜ CI/CD GitHub Actions
- ⬜ Tests de bout en bout

---

## Idées futures (post v1)

- ⬜ Application mobile (React Native)
- ⬜ Notifications email (candidatures, rappels cotisation)
- ⬜ Tableau de bord analytics avancé
- ⬜ Système de rôles et permissions granulaire
- ⬜ Export PDF (liste membres, reçus cotisation)
- ⬜ Mode hors-ligne (PWA)

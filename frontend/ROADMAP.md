# ROADMAP Frontend — RCR React

> Interface moderne et interactive pour la gestion de l'association RCR.
> Stack : React 18 · TypeScript · Vite · TailwindCSS · DaisyUI · TanStack Query · Zustand

---

## ✅ Phase 0 — Backend (terminé)

- 8 modules API : Auth, Mada, Membre, Cotisation, Finance, Blog, Voting, Activités
- API REST disponible sur `http://localhost:5000/api`
- Authentification JWT (Bearer token)

---

## 🔄 Phase 1 — Fondations

> Objectif : projet opérationnel, layout fonctionnel, navigation protégée

- [ ] Init Vite + React 18 + TypeScript
- [ ] Installation toutes les dépendances
- [ ] Configuration TailwindCSS v3 + DaisyUI v4 (thème RCR personnalisé)
- [ ] Helper `cn()` (clsx + tailwind-merge)
- [ ] Instance Axios avec interceptors JWT (attach token, redirect 401)
- [ ] Zustand store `auth` (user, token, login, logout)
- [ ] Zustand store `ui` (sidebar collapse, thème dark/light)
- [ ] Types TypeScript globaux (`Membre`, `User`, `ApiResponse<T>`...)
- [ ] React Router v6 — routes publiques et protégées (`PrivateRoute`)
- [ ] Layout principal : Sidebar + Navbar + zone de contenu
- [ ] Composants UI de base : `Button`, `Badge`, `Modal`, `Input`, `Spinner`, `Avatar`

---

## 📋 Phase 2 — Authentification

- [ ] Page Login
- [ ] Page Forgot Password
- [ ] Page Reset Password (via token URL)
- [ ] Redirection automatique si déjà connecté
- [ ] Persistance session (localStorage + rehydratation Zustand)

---

## 📋 Phase 3 — Dashboard

- [ ] Cartes statistiques (membres, cotisations, contributions, activités)
- [ ] Graphique évolution membres (Recharts — LineChart)
- [ ] Graphique répartition cotisations (BarChart)
- [ ] Derniers membres inscrits
- [ ] Dernières transactions financières
- [ ] Activités en cours

---

## 📋 Phase 4 — Membres

- [ ] Liste membres (DataTable avec tri, filtres, pagination)
- [ ] Fiche détail membre + historique validité
- [ ] Formulaire création membre (multi-étapes)
- [ ] Formulaire édition membre
- [ ] Actions : valider/rejeter, exclure, générer matricule

---

## 📋 Phase 5 — Cotisations

- [ ] Gestion campagnes + types de cotisation
- [ ] Liste cotisations + tranches
- [ ] Saisie paiement + invalidation
- [ ] Stats recouvrement par campagne

---

## 📋 Phase 6 — Finance

- [ ] Liste comptes financiers + soldes
- [ ] Transactions (créer, annuler, filtrer)
- [ ] Répartition analytique
- [ ] Dashboard financier + wallet utilisateur

---

## 📋 Phase 7 — Blog

- [ ] Liste articles (admin) + toggle publier
- [ ] Éditeur article (titre, corps, illustration, slug auto)
- [ ] Page publique liste + article par slug

---

## 📋 Phase 8 — Voting

- [ ] Liste élections + statuts
- [ ] Création élection + choix
- [ ] Interface de vote (auth + token anonyme)
- [ ] Résultats temps réel (graphiques)
- [ ] Tokens + liste électeurs + export CSV

---

## 📋 Phase 9 — Activités

- [ ] Liste activités (publique + admin)
- [ ] Détail (étapes, budget, contributions)
- [ ] CRUD complet + actions terminer/annuler
- [ ] Formulaire contribution

---

## 📋 Phase 10 — Polish & Production

- [ ] Mode sombre / clair (DaisyUI themes)
- [ ] Responsive mobile (sidebar en drawer)
- [ ] Loading skeletons sur toutes les listes
- [ ] Error Boundary global
- [ ] Optimistic updates sur les mutations clés
- [ ] Dockerfile frontend + docker-compose production
- [ ] GitHub Actions CI (lint + build)

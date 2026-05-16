# Guide de contribution — RCR React

Merci de contribuer à ce projet. Merci de lire ce guide **avant** d'écrire du code.

---

## Workflow Git

### Branches

```
main          → code stable, toujours déployable
develop       → branche d'intégration principale
feature/xxx   → nouvelle fonctionnalité  (ex: feature/auth-login)
fix/xxx       → correction de bug        (ex: fix/membre-upload)
chore/xxx     → tâche technique          (ex: chore/update-deps)
```

### Règle d'or

- **Ne jamais pusher directement sur `main`**
- Toujours créer une branche depuis `develop`
- Faire une Pull Request pour merger dans `develop`
- Demander un code review à l'owner

### Cycle de travail

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mon-module

# ... coder, tester ...

git add .
git commit -m "feat(membre): ajouter la pagination de la liste"
git push origin feature/mon-module
# → ouvrir une Pull Request vers develop sur GitHub
```

---

## Conventions de commit (Conventional Commits)

Format : `type(scope): message en minuscule`

| Type       | Usage                                       |
| ---------- | ------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                     |
| `fix`      | Correction de bug                           |
| `refactor` | Refactoring sans changement de comportement |
| `chore`    | Mise à jour dépendances, config             |
| `docs`     | Documentation uniquement                    |
| `test`     | Ajout ou modification de tests              |
| `style`    | Formatage, indentation (pas de logique)     |

**Exemples :**

```
feat(auth): implémenter le login JWT
fix(membre): corriger le calcul du matricule
chore(deps): mettre à jour prisma en 5.x
docs(readme): ajouter les instructions d'installation
```

---

## Règles de code

### Général

- Langue du code : **anglais** (variables, fonctions, commentaires en français possible)
- Langue de l'UI : **malagasy** (labels, messages, textes)
- Toujours typer avec TypeScript — **pas de `any`** sauf cas exceptionnel justifié
- Un fichier = une responsabilité
- Fonctions courtes (< 40 lignes idéalement)
- Noms explicites : `getMembreById` plutôt que `getData`

### Backend (Node.js / Express)

- Un module = un dossier avec : `module.controller.ts`, `module.routes.ts`, `module.service.ts`
- La logique métier va dans le **service**, pas dans le controller
- Le controller appelle le service et renvoie la réponse
- Toujours utiliser les helpers `success()` et `error()` de `src/utils/response.ts`
- Toujours valider les données entrantes avec `express-validator`
- Toujours utiliser `try/catch` dans les controllers

### Frontend (React)

- Un composant = un fichier `.tsx`
- Noms de composants en **PascalCase** : `MembreCard.tsx`
- Noms de hooks en **camelCase** avec préfixe `use` : `useMembres.ts`
- Toujours utiliser **React Query** pour les appels API (pas de `useEffect` + `fetch`)
- Toujours valider les formulaires avec **Zod**
- Pas de logique métier dans les composants → la mettre dans des hooks

### Prisma / Base de données

- Ne jamais modifier `schema.prisma` sans créer une migration : `npx prisma migrate dev`
- Ne jamais modifier les fichiers de migration générés
- Toujours utiliser des transactions Prisma pour les opérations en plusieurs étapes

---

## Structure d'un module backend

Chaque module suit cette structure :

```
src/modules/exemple/
├── exemple.controller.ts   # reçoit req/res, appelle le service
├── exemple.service.ts      # logique métier, appels Prisma
├── exemple.routes.ts       # définition des routes Express
└── exemple.validation.ts   # règles de validation express-validator
```

---

## Sécurité — Points critiques

- **Ne jamais commiter le fichier `.env`** (il est dans `.gitignore`)
- Ne jamais retourner le mot de passe dans une réponse API
- Toujours hasher les mots de passe avec `bcryptjs` (rounds: 12)
- Toujours vérifier le token JWT sur les routes protégées
- Toujours valider et sanitiser les données reçues du client

---

## Installation pour un nouveau collaborateur

```bash
git clone https://github.com/codeline401/rcr-react.git
cd rcr-react/backend
cp .env.dist .env
# → remplir .env avec les valeurs fournies par le lead dev
npm install
docker compose -f docker-compose.dev.yml up -d
npx prisma migrate dev
npm run dev
```

---

## Questions ?

Ouvrir une **Issue** sur GitHub avec le tag approprié (`question`, `bug`, `enhancement`).

# Guide de contribution — Frontend RCR

## Stack technique

| Outil           | Version | Rôle                          |
|-----------------|---------|-------------------------------|
| React           | 18      | UI                            |
| TypeScript      | 5       | Typage statique               |
| Vite            | 5       | Build tool                    |
| TailwindCSS     | 3       | Styles utility-first          |
| DaisyUI         | 4       | Composants UI                 |
| TanStack Query  | 5       | État serveur, cache, fetching |
| Zustand         | 4       | État global client            |
| React Router    | 6       | Navigation SPA                |
| Axios           | 1       | Client HTTP                   |
| React Hook Form | 7       | Formulaires                   |
| Zod             | 3       | Validation schémas            |
| Recharts        | 2       | Graphiques                    |
| Lucide React    | latest  | Icônes                        |
| date-fns        | 3       | Manipulation dates            |

---

## 1. Structure des dossiers

```
src/
├── api/          # Appels HTTP par module (membres.api.ts, auth.api.ts...)
├── components/
│   ├── ui/       # Atomes réutilisables (Button, Badge, Modal, Input...)
│   ├── layout/   # Sidebar, Navbar, PageHeader
│   ├── forms/    # FormField, FileUpload, DatePicker...
│   └── tables/   # DataTable, Pagination, Filters
├── hooks/        # Hooks custom (useAuth, useDebounce, useConfirm...)
├── pages/        # Pages regroupées par module
├── router/       # Configuration React Router (routes + PrivateRoute)
├── stores/       # Zustand stores (auth.store.ts, ui.store.ts)
├── types/        # Types TypeScript partagés
└── utils/        # Helpers purs (cn.ts, format.ts...)
```

---

## 2. Conventions de nommage

| Élément        | Convention           | Exemple                    |
|----------------|----------------------|----------------------------|
| Composants     | PascalCase           | `MembreCard.tsx`           |
| Hooks          | camelCase avec `use` | `useMembreList.ts`         |
| Stores Zustand | camelCase + `.store` | `auth.store.ts`            |
| Fichiers API   | camelCase + `.api`   | `membres.api.ts`           |
| Types          | PascalCase           | `Membre`, `ApiResponse<T>` |
| Constantes     | UPPER_SNAKE_CASE     | `MAX_FILE_SIZE`            |
| Utilitaires    | camelCase            | `formatDate`               |
| Pages          | PascalCase           | `MembreListPage.tsx`       |

---

## 3. Structure d'un composant

Toujours dans cet ordre :

```tsx
// 1. Imports React et librairies externes
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Imports UI (lucide, recharts...)
import { Users } from 'lucide-react';

// 3. Imports internes — api, components, hooks, stores, utils, types
import { getMembres } from '@/api/membres.api';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { Membre } from '@/types';

// 4. Types/interfaces locaux
interface Props {
  districtId?: string;
  onSelect?: (membre: Membre) => void;
}

// 5. Composant — toujours function nommée (jamais arrow au top-level)
function MembreCard({ districtId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  // ...
  return <div>...</div>;
}

// 6. Export default en bas
export default MembreCard;
```

---

## 4. Règles API — TanStack Query

- Un fichier par module : `src/api/membres.api.ts`
- Toutes les query keys centralisées dans `src/api/queryKeys.ts`
- Mutations : invalider systématiquement le cache concerné dans `onSuccess`
- Jamais d'appel HTTP direct dans un composant — passer par les fichiers `api/`

```ts
// ✅ Correct — dans membres.api.ts
export const getMembres = (params: ListParams) =>
  api.get<ApiResponse<Membre[]>>('/membres', { params }).then(r => r.data);

// ✅ Correct — dans un composant
const { data } = useQuery({
  queryKey: queryKeys.membres.list(params),
  queryFn: () => getMembres(params),
});

// ❌ Interdit — appel direct dans un composant
const res = await axios.get('/membres');
```

---

## 5. Règles formulaires — React Hook Form + Zod

- Zod obligatoire pour tous les formulaires
- Le schéma Zod est défini dans le même fichier que le formulaire
- Toujours afficher le message d'erreur sous chaque champ
- Utiliser le composant `FormField` de `src/components/forms/`

```tsx
// Schéma
const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

// Hook
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

// Affichage erreur — toujours présent
{errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
```

---

## 6. Règles CSS — TailwindCSS + DaisyUI

- Pas de `style={}` inline — utiliser TailwindCSS
- Utiliser `cn()` de `@/utils/cn` pour les classes conditionnelles
- Préférer les composants DaisyUI aux classes bas niveau répétées
- Pas de fichiers `.css` custom sauf `globals.css` (variables, reset, fonts)

```tsx
// ✅ Correct
<button className={cn('btn btn-primary', { 'loading': isLoading, 'btn-disabled': disabled })}>

// ❌ Interdit
<button style={{ backgroundColor: '#3b82f6', padding: '8px 16px' }}>

// ✅ DaisyUI préféré
<div className="card card-compact shadow-lg">
  <div className="card-body">...</div>
</div>
```

---

## 7. Règles TypeScript

- Zéro `any` — utiliser `unknown` si vraiment nécessaire, puis narrow
- Toujours typer les props des composants avec une interface
- Les réponses API sont typées via `ApiResponse<T>` défini dans `src/types/`
- Éviter `as` forcé — préférer les guards et les narrowings

```ts
// ✅ Correct
function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

// ❌ Interdit
const data = response as any;
```

---

## 8. Séparation des responsabilités

| Couche          | Responsabilité                        | Ne doit PAS contenir           |
|-----------------|---------------------------------------|--------------------------------|
| `api/*.api.ts`  | Appels HTTP purs, types de retour     | Logique UI, état               |
| `hooks/use*.ts` | Logique réutilisable, TanStack        | JSX, styles                    |
| `pages/`        | Assemblage de composants, layout      | Logique métier complexe        |
| `components/`   | Affichage et interactions UI          | Appels API directs             |
| `stores/`       | État global partagé entre pages       | État local (utiliser useState) |

---

## 9. Gestion des erreurs

- Les erreurs API sont interceptées dans `api/client.ts` (interceptor Axios)
- Afficher les toasts d'erreur via `react-hot-toast`
- Les erreurs de rendu sont catchées par le `ErrorBoundary` global
- Toujours gérer les états `isLoading`, `isError`, `isEmpty` dans les listes

```tsx
// Pattern standard pour une liste
if (isLoading) return <TableSkeleton />;
if (isError) return <ErrorMessage message="Impossible de charger les membres" />;
if (!data?.length) return <EmptyState message="Aucun membre trouvé" />;
return <DataTable data={data} />;
```

---

## 10. Git

- Branches : `feature/nom-feature`, `fix/nom-bug`, `chore/nom-tâche`
- Commits conventionnels :

```
feat: ajouter la page liste membres
fix: corriger le filtre par district
chore: mise à jour des dépendances
style: harmoniser les espacements du Navbar
refactor: extraire useMembreFilters
```

- PR toujours sur `develop` — jamais directement sur `main`
- Rebaser sur `develop` avant de soumettre une PR

---

## 11. Commandes utiles

```bash
# Démarrer le frontend (dev)
npm run dev

# Vérifier les types TypeScript
npx tsc --noEmit

# Linter
npm run lint

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

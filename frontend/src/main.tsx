import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { router } from './router'
import ThemeProvider from './providers/ThemeProvider'

/**
 * Client TanStack Query global.
 * - Données considérées fraîches pendant 5 minutes (staleTime).
 * - Maximum 1 tentative automatique en cas d'échec (retry: 1).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

/**
 * Point d'entrée de l'application React.
 * Monte l'arbre : StrictMode > QueryClientProvider > ThemeProvider > RouterProvider.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)

import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

/**
 * Instance Axios préconfigurée pour l'API RCR.
 * - baseURL lue depuis VITE_API_URL (fallback localhost:5000/api)
 * - Timeout de 15 secondes
 * - Intercepteur request : injecte le JWT Bearer token
 * - Intercepteur response : redirige vers /login sur erreur 401
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/**
 * Intercepteur de requête : attache l'en-tête Authorization si un token JWT est présent en store.
 */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Intercepteur de réponse : en cas de 401 (hors endpoint login),
 * efface la session et redirige l'utilisateur vers la page de connexion.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginEndpoint) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api

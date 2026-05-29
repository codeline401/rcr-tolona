import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/**
 * Route protégée : redirige vers `/login` si l'utilisateur n'est pas authentifié.
 * Passe la localisation courante dans le state pour permettre une redirection
 * retour après connexion réussie.
 */
export default function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

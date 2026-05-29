import { Link } from 'react-router-dom'

/**
 * Page 404 — affichée pour toute route inconnue.
 * Propose un lien de retour vers le dashboard.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-200 text-center">
      <h1 className="text-6xl font-black text-primary">404</h1>
      <p className="text-xl font-semibold text-base-content">Page introuvable</p>
      <p className="text-base-content/60">La page demandée n'existe pas.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Retour au Dashboard
      </Link>
    </div>
  )
}

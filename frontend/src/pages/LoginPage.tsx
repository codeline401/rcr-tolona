import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/axios'
import type { ApiResponse, AuthTokenPayload } from '../types'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<ApiResponse<AuthTokenPayload>>('/auth/login', { email, password })
      login(data.data.user, data.data.token)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold text-primary">RCR</h2>
          <p className="text-center text-sm text-base-content/60">Connexion à l'espace admin</p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@rcr.mg"
            />
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              error={error || undefined}
            />
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { ApiError, apiFetch } from '@/lib/api/http'

/** Retour après déverrouillage : uniquement un chemin interne (jamais une adresse externe). */
const safeTarget = (from: string | null): string => (from && from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard')

/**
 * Le jeton de session reste valide : le verrouillage ne fait que masquer l'écran. Pour le lever, le mot de passe est
 * revérifié par l'API (`POST /auth/login`) ; pour le personnel la réponse est un défi 2FA, ce qui prouve que le mot de passe
 * est correct sans ouvrir de nouvelle session.
 */
const LockScreen = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const from = useSearchParams().get('from')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = session?.user?.email
    if (!email) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch(API_ENDPOINTS.LOGIN, { method: 'POST', body: { email, password } })
      router.replace(safeTarget(from))
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 429
            ? 'Trop de tentatives. Réessayez dans quelques instants.'
            : err.status === 401
              ? 'Mot de passe incorrect.'
              : err.message
          : "Impossible de joindre l'API.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="text-start mb-3" onSubmit={unlock}>
      <div className="mb-3">
        <label className="form-label" htmlFor="lock-password">Mot de passe</label>
        <input
          id="lock-password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
      <div className="mb-2 d-grid">
        <button className="btn btn-primary fw-semibold" type="submit" disabled={busy || !password || !session?.user?.email}>
          Déverrouiller
        </button>
      </div>
    </form>
  )
}

export default LockScreen

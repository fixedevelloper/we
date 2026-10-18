'use client'
import { useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ApiError, apiFetch } from '@/lib/api/http'

/** Page ouverte depuis le lien reçu par e-mail (réinitialisation, ou première connexion d'un membre invité). */
const ResetPassword = () => {
  const token = useSearchParams().get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) return setError('Les deux mots de passe sont différents.')
    setBusy(true)
    try {
      await apiFetch('/auth/password-reset/confirm', { method: 'POST', body: { token, newPassword: password } })
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.fullMessage : 'Erreur inattendue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-3">
        <Col xl={3} lg={4} md={6}>
          <Card className="rounded-4 p-4 text-center">
            <h4 className="fw-semibold mb-3 fs-18">Choisir un mot de passe</h4>
            {!token ? (
              <p className="text-danger">
                Lien invalide. <Link href="/auth/recover-password">Demander un nouveau lien</Link>
              </p>
            ) : done ? (
              <>
                <p className="text-muted">Mot de passe enregistré. Vous pouvez maintenant vous connecter.</p>
                <Link href="/auth/login" className="btn btn-primary">Se connecter</Link>
              </>
            ) : (
              <form onSubmit={submit} className="text-start">
                <p className="small text-muted">10 caractères au minimum.</p>
                <input className="form-control mb-3" type="password" autoComplete="new-password" minLength={10} maxLength={128} required placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input className="form-control mb-3" type="password" autoComplete="new-password" required placeholder="Confirmer" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                {error && (
                  <div className="alert alert-danger py-2">
                    {error} <Link href="/auth/recover-password" className="alert-link">Demander un nouveau lien</Link>
                  </div>
                )}
                <div className="d-grid">
                  <Button type="submit" disabled={busy || password.length < 10 || password !== confirm}>Enregistrer</Button>
                </div>
              </form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ResetPassword

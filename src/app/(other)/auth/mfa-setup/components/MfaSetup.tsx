'use client'
import { useEffect, useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { signOut, useSession } from 'next-auth/react'
import QRCode from 'qrcode'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { ApiError, apiFetch } from '@/lib/api/http'

type Enrollment = { secret: string; otpauthUri: string }

/**
 * Activation de la double authentification, obligatoire pour le personnel. Le compte n'a, avant cela, qu'un jeton limité à
 * cette opération : une fois le code confirmé, il faut se reconnecter pour obtenir un jeton complet.
 */
const MfaSetup = () => {
  const { data: session, status } = useSession()
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [qr, setQr] = useState<string>('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!session?.accessToken || enrollment) return
    apiFetch<Enrollment>('/me/mfa/enrollment', { method: 'POST', token: session.accessToken })
      .then(async (e) => {
        setEnrollment(e)
        setQr(await QRCode.toDataURL(e.otpauthUri, { width: 220, margin: 1 }))
      })
      .catch((e: ApiError) => setError(e.message))
  }, [session?.accessToken, enrollment])

  const confirm = async () => {
    if (!session?.accessToken) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch('/me/mfa/confirmation', { method: 'POST', token: session.accessToken, body: { code } })
      setDone(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erreur inattendue')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-3">
        <Col xl={4} lg={5} md={7}>
          <Card className="rounded-4 p-4 text-center">
            <h4 className="fw-semibold mb-2 fs-18">Activer la double authentification</h4>
            {done ? (
              <>
                <p className="text-muted">Double authentification activée. Reconnectez-vous pour continuer.</p>
                <Button onClick={() => signOut({ callbackUrl: '/auth/login' })}>Se reconnecter</Button>
              </>
            ) : (
              <>
                <p className="text-muted">
                  La double authentification est obligatoire pour le personnel. Scannez ce code avec une application
                  d'authentification (Google Authenticator, Authy...), puis saisissez le code à 6 chiffres.
                </p>
                {qr && <img src={qr} alt="QR code" width={220} height={220} className="mx-auto mb-2" />}
                {enrollment && (
                  <p className="small text-muted text-break">
                    Ou saisissez la clé : <code>{enrollment.secret}</code>
                  </p>
                )}
                <input
                  className="form-control mb-3 text-center"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <Button disabled={busy || code.length !== 6 || !enrollment} onClick={confirm}>
                  Confirmer
                </Button>
                <Button variant="link" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                  Annuler
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default MfaSetup

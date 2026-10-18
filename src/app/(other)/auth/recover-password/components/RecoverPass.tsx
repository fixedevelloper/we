'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { ApiError, apiFetch } from '@/lib/api/http'

const RecoverPass = () => {
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const schema = yup.object({ email: yup.string().email('Adresse e-mail invalide').required('Saisissez votre adresse e-mail') })
  const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) })

  const submit = handleSubmit(async ({ email }) => {
    setLoading(true)
    setError(null)
    try {
      // L'API répond toujours 204 : elle ne révèle pas si le compte existe.
      await apiFetch('/auth/password-reset/request', { method: 'POST', body: { email } })
      setSentTo(email)
      setSent(true)
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 429 ? 'Trop de demandes. Réessayez dans quelques instants.' : e.fullMessage) : "Impossible de joindre l'API.")
    } finally {
      setLoading(false)
    }
  })

  if (sent) {
    return (
      <div className="mb-3">
        <p className="text-muted mb-2">
          Si un compte existe pour <strong>{sentTo}</strong>, un e-mail contenant un lien de réinitialisation vient d'être envoyé. Pensez à vérifier vos courriers indésirables.
        </p>
        <button type="button" className="btn btn-link p-0" onClick={() => setSent(false)}>
          Utiliser une autre adresse
        </button>
      </div>
    )
  }
  return (
    <form onSubmit={submit} className="text-start mb-3">
      <div className="mb-3">
        <TextFormInput control={control} name="email" type="email" autoComplete="username" autoFocus label="E-mail" placeholder="Votre adresse e-mail" />
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="d-grid">
        <button className="btn btn-primary fw-semibold" type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </div>
    </form>
  )
}

export default RecoverPass

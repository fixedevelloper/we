'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { apiFetch } from '@/lib/api/http'
import { useNotificationContext } from '@/context/useNotificationContext'

const RecoverPass = () => {
  const { showNotification } = useNotificationContext()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const schema = yup.object({ email: yup.string().email('Adresse e-mail invalide').required('Saisissez votre adresse e-mail') })
  const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) })

  const submit = handleSubmit(async ({ email }) => {
    setLoading(true)
    try {
      // L'API répond toujours 204 : elle ne révèle pas si le compte existe.
      await apiFetch('/auth/password-reset/request', { method: 'POST', body: { email } })
      setSent(true)
    } catch (e: any) {
      showNotification({ message: e?.message ?? 'Erreur inattendue', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  if (sent) {
    return <p className="text-muted">Si un compte existe pour cette adresse, un e-mail contenant un lien de réinitialisation vient d'être envoyé.</p>
  }
  return (
    <form onSubmit={submit} className="text-start mb-3">
      <div className="mb-3">
        <TextFormInput control={control} name="email" placeholder="Votre adresse e-mail" />
      </div>
      <div className="d-grid">
        <button className="btn btn-primary fw-semibold" type="submit" disabled={loading}>
          Envoyer le lien
        </button>
      </div>
    </form>
  )
}

export default RecoverPass

'use client'
import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'
import { yupResolver } from '@hookform/resolvers/yup'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { safeRedirectPath } from '@/utils/safe-redirect'
import { MFA_REQUIRED_PREFIX } from '@/lib/api/auth-constants'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  /** Jeton court renvoyé par l'API quand la double authentification est demandée. */
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Adresse e-mail invalide').required('Saisissez votre adresse e-mail'),
    password: yup.string().required('Saisissez votre mot de passe'),
    code: yup.string().matches(/^(\d{6})?$/, 'Le code compte 6 chiffres').default(''),
  })

  const { control, handleSubmit, reset, getValues } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      setLoading(true)

      if (mfaToken && !values.code) {
        showNotification({ message: 'Saisissez le code à 6 chiffres de votre application.', variant: 'danger' })
        return
      }

      const res = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        ...(mfaToken ? { mfaToken, code: values.code } : {}),
      })

      if (res?.ok) {
        push(safeRedirectPath(queryParams['redirectTo']))
        showNotification({ message: 'Connexion réussie. Redirection en cours...', variant: 'success' })
      } else if (res?.error?.startsWith(MFA_REQUIRED_PREFIX)) {
        // Mot de passe accepté : on demande le code de la double authentification.
        setMfaToken(res.error.substring(MFA_REQUIRED_PREFIX.length))
      } else {
        if (mfaToken) {
          // Code refusé ou jeton expiré : on repart de l'étape mot de passe si le jeton est périmé.
          reset({ ...getValues(), code: '' })
        }
        showNotification({ message: res?.error ?? 'Identifiants incorrects', variant: 'danger' })
      }
    } catch (err) {
      console.error(err)
      showNotification({ message: 'Erreur de connexion. Veuillez réessayer.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  /** Revient à l'étape e-mail / mot de passe (jeton MFA perdu ou expiré). */
  const restart = () => {
    setMfaToken(null)
    reset({ email: getValues('email'), password: '', code: '' })
  }

  return { loading, login, control, mfaRequired: mfaToken !== null, restart }
}

export default useSignIn

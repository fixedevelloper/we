'use client'
import type { ChildrenType } from '@/types/component-props'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import FallbackLoading from '../FallbackLoading'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { data: session, status } = useSession()
  const { push } = useRouter()
  const pathname = usePathname()

  // Redirection en effet (jamais pendant le rendu), chemin encodé pour éviter l'injection de paramètres.
  useEffect(() => {
    if (status === 'unauthenticated') {
      push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`)
    } else if (session?.error === 'RefreshTokenError') {
      // Session API terminée (refresh expiré ou révoqué) : retour à la connexion.
      signOut({ callbackUrl: `/auth/login?redirectTo=${encodeURIComponent(pathname)}` })
    } else if (status === 'authenticated' && session?.user?.mfaEnabled === false) {
      // Personnel sans double authentification : seul l'écran d'activation est permis.
      push('/auth/mfa-setup')
    }
  }, [status, session, pathname, push])

  if (status === 'unauthenticated' || session?.error || session?.user?.mfaEnabled === false) {
    return <FallbackLoading />
  }

  return <Suspense>{children}</Suspense>
}

export default AuthProtectionWrapper

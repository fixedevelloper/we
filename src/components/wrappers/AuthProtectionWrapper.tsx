'use client'
import type { ChildrenType } from '@/types/component-props'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import FallbackLoading from '../FallbackLoading'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { status } = useSession()
  const { push } = useRouter()
  const pathname = usePathname()

  // Redirection en effet (jamais pendant le rendu), chemin encodé pour éviter l'injection de paramètres.
  useEffect(() => {
    if (status === 'unauthenticated') {
      push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`)
    }
  }, [status, pathname, push])

  if (status === 'unauthenticated') {
    return <FallbackLoading />
  }

  return <Suspense>{children}</Suspense>
}

export default AuthProtectionWrapper

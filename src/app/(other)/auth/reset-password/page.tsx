import { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPassword from './components/ResetPassword'

export const metadata: Metadata = { title: 'Choisir un mot de passe' }

const ResetPasswordPage = () => (
  <Suspense>
    <ResetPassword />
  </Suspense>
)

export default ResetPasswordPage

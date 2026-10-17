import { Metadata } from 'next'
import MfaSetup from './components/MfaSetup'

export const metadata: Metadata = { title: 'Activer la double authentification' }

const MfaSetupPage = () => {
  return <MfaSetup />
}

export default MfaSetupPage

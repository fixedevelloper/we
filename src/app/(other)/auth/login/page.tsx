import { Metadata } from 'next'
import Login from './component/Login'

export const metadata: Metadata = { title: 'Connexion' }

const LoginPage = () => {
  return <Login />
}

export default LoginPage

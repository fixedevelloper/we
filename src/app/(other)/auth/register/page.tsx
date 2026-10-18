import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import { currentYear, developedBy } from '@/context/constants'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'

export const metadata: Metadata = { title: 'Accès au back-office' }

/**
 * Pas d'inscription libre : l'API n'ouvre `POST /auth/register` qu'aux comptes clients (application mobile), qui ne peuvent
 * pas se connecter ici. Un compte du personnel est créé par invitation (page Personnel), puis la personne choisit son mot de
 * passe depuis le lien reçu par e-mail.
 */
const RegisterPage = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={3} lg={4} md={6}>
          <Card className="overflow-hidden text-center rounded-4 p-xxl-4 p-3 mb-0">
            <Link href="/" className="auth-brand mb-4">
              <Image src={logoDark} alt="dark logo" height={26} className="logo-dark" />
              <Image src={logo} alt="logo light" height={26} className="logo-light" />
            </Link>
            <h4 className="fw-semibold mb-2 fs-18">Accès sur invitation</h4>
            <p className="text-muted mb-3">
              Les comptes du back-office ne se créent pas en ligne. Un administrateur vous invite depuis la page Personnel : vous
              recevez un e-mail avec un lien pour choisir votre mot de passe, puis vous activez la double authentification.
            </p>
            <p className="text-muted mb-4">Vous n'avez pas reçu d'invitation ? Contactez un administrateur.</p>
            <div className="d-grid mb-3">
              <Link href="/auth/login" className="btn btn-primary fw-semibold">
                Se connecter
              </Link>
            </div>
            <Link href="/auth/recover-password" className="text-muted fs-14">
              Mot de passe oublié ?
            </Link>
          </Card>
          <p className="mt-4 text-center mb-0">
            {currentYear} © Wetransfert cash - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
          </p>
        </Col>
      </Row>
    </div>
  )
}

export default RegisterPage

'use client'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import { currentYear, developedBy } from '@/context/constants'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'
import LockScreen from './components/LockScreen'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'


const LockScreenPage = () => {
  const { data: session, status } = useSession();
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={3} lg={4} md={6}>
          <Card className="overflow-hidden text-center rounded-4 p-xxl-4 p-3 mb-0">
            <Link href="/" className="auth-brand mb-4">
              <Image src={logoDark} alt="dark logo" height={26} className="logo-dark" />
              <Image src={logo} alt="logo light" height={26} className="logo-light" />
            </Link>
            <div className="text-center">
              <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-inline-flex align-items-center justify-content-center" style={{ width: 96, height: 96, fontSize: 34 }}>
                {(session?.user?.name ?? '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'}
              </div>
              <div className="mt-2 mb-3">
                <h4 className="fw-semibold text-dark">{status === 'loading' ? ' ' : session?.user?.name ?? 'Session expirée'}</h4>
                <p className="mb-0 text-muted">
                  {status === 'unauthenticated' ? 'Votre session a expiré, reconnectez-vous.' : 'Session verrouillée. Saisissez votre mot de passe pour continuer.'}
                </p>
              </div>
            </div>
            {status === 'unauthenticated' ? null : (
              <Suspense>
                <LockScreen />
              </Suspense>
            )}
            <p className="text-muted fs-14 mb-0">
              Ce n'est pas vous ?
              <Link href="/auth/logout" className="fw-semibold text-danger ms-1">
                Se déconnecter
              </Link>
            </p>
          </Card>
          <p className="mt-3 text-center mb-0">
            {currentYear} © Wetransfert cash - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
          </p>
        </Col>
      </Row>
    </div>
  )
}

export default LockScreenPage

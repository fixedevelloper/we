'use client'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import { currentYear } from '@/context/constants'
import Image from 'next/image'
import Link from 'next/link'
import {Button, Card, Col, Row} from 'react-bootstrap'
import useSignIn from './useSignIn'
import TextFormInput from '@/components/form/TextFormInput'
import {developedBy} from "../../../../../context/constants";
import Spinner from "../../../../../components/Spinner";
import IconifyIcon from "../../../../../components/wrappers/IconifyIcon";
import React, { useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'

const Login = () => {
  const { loading, login, control, mfaRequired, restart } = useSignIn()
  // next-auth renvoie ici avec ?error=… : un code technique (CredentialsSignin…) ou le message de l'API.
  const [urlError, setUrlError] = useState<string | null>(null)
  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get('error')
    if (!e) return
    setUrlError(/^[A-Za-z]+$/.test(e) ? (e === 'SessionRequired' ? 'Votre session a expiré, reconnectez-vous.' : 'Identifiants incorrects.') : e)
  }, [])
  //console.log(loading)
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={3} lg={4} md={6}>
          <Card className="overflow-hidden text-center rounded-4 p-xxl-4 p-3 mb-0">
            <Link href="/" className="auth-brand mb-4">
              <Image src={logoDark} alt="dark logo" height={26} className="logo-dark" />
              <Image src={logo} alt="logo light" height={26} className="logo-light" />
            </Link>
            <h4 className="fw-semibold mb-2 fs-18">Connexion au back-office</h4>
            <p className="text-muted mb-4">
              {mfaRequired
                ? "Saisissez le code à 6 chiffres affiché par votre application d'authentification."
                : 'Saisissez votre adresse e-mail et votre mot de passe.'}
            </p>
            {urlError && !mfaRequired && <Alert variant="danger" className="py-2 text-start">{urlError}</Alert>}
            <form onSubmit={login} action="/" className="text-start mb-3">
              <div className="mb-3" hidden={mfaRequired}>
                <TextFormInput
                  control={control}
                  name="email"
                  placeholder="Votre adresse e-mail"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  className="bg-light bg-opacity-50 border-light py-2"
                  label="E-mail"
                />
              </div>
              <div className="mb-3" hidden={mfaRequired}>
                <TextFormInput
                  control={control}
                  name="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  className="bg-light bg-opacity-50 border-light py-2"
                  label="Mot de passe"
                />
              </div>
              {mfaRequired && (
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="code"
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    className="bg-light bg-opacity-50 border-light py-2"
                    label="Code de vérification"
                  />
                  <button type="button" className="btn btn-link p-0 mt-2" onClick={restart}>
                    Recommencer
                  </button>
                </div>
              )}
              <div className="d-flex justify-content-between mb-3">
                <span />
                <Link href="/auth/recover-password" className="text-muted border-bottom border-dashed">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="d-grid">
                <button disabled={loading} className="btn btn-primary fw-semibold" type="submit">
                  {loading ? (
                      <>
                        <Spinner size="sm" color="light" className="me-2" /> Connexion...
                      </>
                  ) : (
                      <>
                        <IconifyIcon icon="ri:edit-2-line" className="me-1" /> {mfaRequired ? 'Valider' : 'Se connecter'}
                      </>
                  )}
                </button>

              </div>
            </form>
          </Card>
          <p className=" mt-4 text-center mb-0">
            {currentYear} © Wetransfert cash - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
          </p>
        </Col>
      </Row>
    </div>
  )
}

export default Login

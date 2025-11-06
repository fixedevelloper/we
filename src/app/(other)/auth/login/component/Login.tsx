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
import React from "react";

const Login = () => {
  const { loading, login, control } = useSignIn()
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
            <h4 className="fw-semibold mb-2 fs-18">Log in to your account</h4>
            <p className="text-muted mb-4">Enter your email address and password to access admin panel.</p>
            <form onSubmit={login} action="/" className="text-start mb-3">
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="email"
                  placeholder="Enter your email"
                  className="bg-light bg-opacity-50 border-light py-2"
                  label="Email"
                />
              </div>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="password"
                  placeholder="Enter your password"
                  className="bg-light bg-opacity-50 border-light py-2"
                  label="Password"
                />
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="checkbox-signin" />
                  <label className="form-check-label" htmlFor="checkbox-signin">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/recover-password" className="text-muted border-bottom border-dashed">
                  Forget Password ?
                </Link>
              </div>
              <div className="d-grid">
                <button disabled={loading} className="btn btn-primary fw-semibold" type="submit">
                  {loading ? (
                      <>
                        <Spinner size="sm" color="light" className="me-2" /> Login...
                      </>
                  ) : (
                      <>
                        <IconifyIcon icon="ri:edit-2-line" className="me-1" /> Login
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

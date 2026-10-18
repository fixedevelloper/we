import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import SettingsCard from './components/SettingsCard'

export const metadata: Metadata = { title: 'Paramètres' }

const SettingsPage = () => {
  return (
    <>
      <PageTitle title="Paramètres" subTitle="Réglages de la plateforme" />
      <Row>
        <Col xs={12}>
          <SettingsCard />
        </Col>
      </Row>
    </>
  )
}

export default SettingsPage

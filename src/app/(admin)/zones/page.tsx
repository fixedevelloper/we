import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import ZoneCard from "./components/ZoneCard";

export const metadata: Metadata = { title: 'Zones tarifaires' }

const ZonePage = () => {
  return (
      <>
        <PageTitle title="Zones tarifaires" subTitle="Regroupements de pays pour les frais" />
        <Row>
          <Col xs={12}>
            <ZoneCard />
          </Col>
        </Row>
      </>
  )
}

export default ZonePage
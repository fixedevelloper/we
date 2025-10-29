import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import ZoneCard from "./components/ZoneCard";

export const metadata: Metadata = { title: 'zones' }

const ZonePage = () => {
  return (
      <>
        <PageTitle title="Zones pays" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <ZoneCard />
          </Col>
        </Row>
      </>
  )
}

export default ZonePage
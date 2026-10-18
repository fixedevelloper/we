import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import WebTokenCard from "./components/WebTokenCard";

export const metadata: Metadata = { title: 'Jetons web' }

const WebTokenPage = () => {
  return (
      <>
        <PageTitle title="Jetons web" subTitle="Liens de paiement WhatsApp" />
        <Row>
          <Col xs={12}>
            <WebTokenCard />
          </Col>
        </Row>
      </>
  )
}

export default WebTokenPage
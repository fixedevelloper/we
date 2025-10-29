import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import SenderCard from "./components/SenderCard";

export const metadata: Metadata = { title: 'Expediteurs' }

const SendersPage = () => {
  return (
      <>
        <PageTitle title="Expediteurs" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <SenderCard />
          </Col>
        </Row>
      </>
  )
}

export default SendersPage
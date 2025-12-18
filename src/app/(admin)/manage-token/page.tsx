import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import WebTokenCard from "./components/WebTokenCard";

export const metadata: Metadata = { title: 'Manage tokens' }

const WebTokenPage = () => {
  return (
      <>
        <PageTitle title="Manage token" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <WebTokenCard />
          </Col>
        </Row>
      </>
  )
}

export default WebTokenPage
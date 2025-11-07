import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import AuditCard from './components/AuditCard';

export const metadata: Metadata = { title: 'RechaAuditsrges' }

const AuditsPage = () => {
  return (
      <>
        <PageTitle title="Audits" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <AuditCard />
          </Col>
        </Row>
      </>
  )
}

export default AuditsPage
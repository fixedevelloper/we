import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import AdjustmentCard from './components/AdjustmentCard'

export const metadata: Metadata = { title: 'Ajustements de solde' }

const AdjustmentsPage = () => {
  return (
    <>
      <PageTitle title="Ajustements de solde" subTitle="Double validation" />
      <Row>
        <Col xs={12}>
          <AdjustmentCard />
        </Col>
      </Row>
    </>
  )
}

export default AdjustmentsPage

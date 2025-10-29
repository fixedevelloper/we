import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import TransactionsCard from "./components/rechargeCard";

export const metadata: Metadata = { title: 'Recharges' }

const RechargesPage = () => {
  return (
    <>
      <PageTitle title="Recharges" subTitle="Listes" />
      <Row>
        <Col xs={12}>
          <TransactionsCard />
        </Col>
      </Row>
    </>
  )
}

export default RechargesPage

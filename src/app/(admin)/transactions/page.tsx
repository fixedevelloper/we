import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import TransactionsCard from "./components/transactionCard";

export const metadata: Metadata = { title: 'Transferts' }

const TranstionsPage = () => {
  return (
    <>
      <PageTitle title="Transferts" subTitle="Listes" />
      <Row>
        <Col xs={12}>
          <TransactionsCard />
        </Col>
      </Row>
    </>
  )
}

export default TranstionsPage

import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import ExchangeRateCard from './components/ExchangeRateCard'

export const metadata: Metadata = { title: 'Taux de change' }

const ExchangeRatesPage = () => {
  return (
    <>
      <PageTitle title="Taux de change" subTitle="Historique et publication des taux" />
      <Row>
        <Col xs={12}>
          <ExchangeRateCard />
        </Col>
      </Row>
    </>
  )
}

export default ExchangeRatesPage

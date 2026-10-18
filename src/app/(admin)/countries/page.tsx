import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import CountryCard from "./components/CountryCard";

export const metadata: Metadata = { title: 'Pays' }

const CountriesPage = () => {
  return (
      <>
        <PageTitle title="Pays" subTitle="Pays d'envoi et de réception" />
        <Row>
          <Col xs={12}>
            <CountryCard />
          </Col>
        </Row>
      </>
  )
}

export default CountriesPage
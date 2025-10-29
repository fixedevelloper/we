import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import CountryCard from "./components/CountryCard";

export const metadata: Metadata = { title: 'Recharges' }

const CountriesPage = () => {
  return (
      <>
        <PageTitle title="Pays" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <CountryCard />
          </Col>
        </Row>
      </>
  )
}

export default CountriesPage
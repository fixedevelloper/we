import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import CustomerCard from "./components/CustomerCard";

export const metadata: Metadata = { title: 'Clients' }

const CustomersPage = () => {
  return (
      <>
        <PageTitle title="Clients" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <CustomerCard />
          </Col>
        </Row>
      </>
  )
}

export default CustomersPage
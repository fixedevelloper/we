import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import CustomerCard from "./components/CustomerCard";

export const metadata: Metadata = { title: 'Client' }

const CustomersPage = () => {
  return (
      <>
        <PageTitle title="Pays" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <CustomerCard />
          </Col>
        </Row>
      </>
  )
}

export default CustomersPage
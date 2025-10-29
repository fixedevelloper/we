import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import EmployeeCard from "./components/EmployeeCard";

export const metadata: Metadata = { title: 'Client' }

const EmployesPage = () => {
  return (
      <>
        <PageTitle title="Employes" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <EmployeeCard />
          </Col>
        </Row>
      </>
  )
}

export default EmployesPage
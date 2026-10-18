import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import EmployeeCard from "./components/EmployeeCard";

export const metadata: Metadata = { title: 'Personnel' }

const EmployesPage = () => {
  return (
      <>
        <PageTitle title="Personnel" subTitle="Comptes du back-office" />
        <Row>
          <Col xs={12}>
            <EmployeeCard />
          </Col>
        </Row>
      </>
  )
}

export default EmployesPage
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import BeneficiaryCard from "./components/BeneficiaryCard";

export const metadata: Metadata = { title: 'Beneficiaries' }

const BeneficiariesPage = () => {
  return (
      <>
        <PageTitle title="Beneficiaries" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <BeneficiaryCard />
          </Col>
        </Row>
      </>
  )
}

export default BeneficiariesPage
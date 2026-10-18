import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import PartyListCard from '@/components/parties/PartyListCard'

export const metadata: Metadata = { title: 'Bénéficiaires' }

const Page = () => {
  return (
    <>
      <PageTitle title="Bénéficiaires" subTitle="Bénéficiaires de tous les clients" />
      <Row>
        <Col xs={12}>
          <PartyListCard role="BENEFICIARY" />
        </Col>
      </Row>
    </>
  )
}

export default Page

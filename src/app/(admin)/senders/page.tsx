import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import PartyListCard from '@/components/parties/PartyListCard'

export const metadata: Metadata = { title: 'Expéditeurs' }

const Page = () => {
  return (
    <>
      <PageTitle title="Expéditeurs" subTitle="Liste" />
      <Row>
        <Col xs={12}>
          <PartyListCard role="SENDER" />
        </Col>
      </Row>
    </>
  )
}

export default Page

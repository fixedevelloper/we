import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import ConnexionCard from './components/ConnexionCard';

export const metadata: Metadata = { title: 'connexions' }

const ConnexionsPage = () => {
  return (
      <>
        <PageTitle title="Connexions" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <ConnexionCard />
          </Col>
        </Row>
      </>
  )
}

export default ConnexionsPage
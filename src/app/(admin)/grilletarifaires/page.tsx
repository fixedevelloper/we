import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import GrilleTarifaireCard from "./components/GrilleTarifaireCard";

export const metadata: Metadata = { title: 'Recharges' }

const GrilleTarifairePage = () => {
  return (
      <>
        <PageTitle title="Grille tarifaire" subTitle="Listes" />
        <Row>
          <Col xs={12}>
            <GrilleTarifaireCard />
          </Col>
        </Row>
      </>
  )
}

export default GrilleTarifairePage
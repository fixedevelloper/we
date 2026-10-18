import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import GrilleTarifaireCard from "./components/GrilleTarifaireCard";

export const metadata: Metadata = { title: 'Grille tarifaire' }

const GrilleTarifairePage = () => {
  return (
      <>
        <PageTitle title="Grille tarifaire" subTitle="Frais par zone et par tranche" />
        <Row>
          <Col xs={12}>
            <GrilleTarifaireCard />
          </Col>
        </Row>
      </>
  )
}

export default GrilleTarifairePage
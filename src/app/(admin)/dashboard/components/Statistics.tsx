'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { formatMoney } from '@/lib/api/format'
import type { Dashboard } from '@/lib/api/types'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { activityChart, amountOf, feesChart } from '../data'

const sum = (values: string[]) => values.reduce((t, v) => t + amountOf(v), 0)

const Statistics = ({ dashboard }: { dashboard: Dashboard }) => {
  const { months, currency } = dashboard
  const last = months[months.length - 1]
  const money = (v: string | number) => formatMoney({ amount: String(v), currency })
  const activity = activityChart(months, currency)
  const fees = feesChart(months, currency)

  return (
    <Row>
      <Col xl={7}>
        <Card>
          <div className="card-header">
            <h4 className="header-title">Activité sur 12 mois</h4>
          </div>
          <CardBody className="px-0 pt-0">
            <div className="bg-light bg-opacity-50">
              <Row className="text-center">
                <Col md={6} xs={6}>
                  <p className="text-muted mt-3 mb-1">Transferts (ce mois)</p>
                  <h4 className="mb-3">
                    <ArrowUpRight className="text-danger me-1" />
                    <span>{money(last.transferVolume)}</span>
                  </h4>
                </Col>
                <Col md={6} xs={6}>
                  <p className="text-muted mt-3 mb-1">Recharges (ce mois)</p>
                  <h4 className="mb-3">
                    <ArrowDownLeft className="text-success me-1" />
                    <span>{money(last.topUpVolume)}</span>
                  </h4>
                </Col>
              </Row>
            </div>
            <div dir="ltr" className="px-1 mt-2">
              <ReactApexChart options={activity} series={activity.series} height={310} type="line" />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={5}>
        <Card>
          <div className="card-header">
            <h4 className="header-title">Frais perçus</h4>
          </div>
          <CardBody className="px-0 pt-0" style={{ minHeight: '455px' }}>
            <div className="border-top border-bottom border-light border-dashed">
              <Row className="text-center align-items-center">
                <Col md={4}>
                  <p className="text-muted mt-3 mb-1">Frais (12 mois)</p>
                  <h4 className="mb-3">
                    <IconifyIcon icon="ri:bar-chart-line" className="me-1" />
                    <span>{money(sum(months.map((m) => m.fees)))}</span>
                  </h4>
                </Col>
                <Col md={4} className="border-start border-light border-dashed">
                  <p className="text-muted mt-3 mb-1">Transferts payés</p>
                  <h4 className="mb-3">
                    <IconifyIcon icon="ri:arrow-left-up-box-line" className="text-danger me-1" />
                    <span>{months.reduce((t, m) => t + m.transferCount, 0).toLocaleString('fr-FR')}</span>
                  </h4>
                </Col>
                <Col md={4} className="border-start border-end border-light border-dashed">
                  <p className="text-muted mt-3 mb-1">Soldes clients</p>
                  <h4 className="mb-3">
                    <IconifyIcon icon="ri:arrow-left-down-box-line" className="text-success me-1" />
                    <span>{money(dashboard.walletBalance)}</span>
                  </h4>
                </Col>
              </Row>
            </div>
            <div dir="ltr" className="px-2">
              <ReactApexChart options={fees} series={fees.series} height={310} type="bar" />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default Statistics

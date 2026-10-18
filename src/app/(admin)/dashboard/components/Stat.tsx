'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { formatMoney } from '@/lib/api/format'
import type { Dashboard } from '@/lib/api/types'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { amountOf, seriesOf, sparkline } from '../data'

/** Évolution par rapport au mois précédent ; sans point de comparaison (mois précédent à zéro) on ne l'invente pas. */
const Delta = ({ current, previous }: { current: number; previous: number }) => {
  if (previous === 0) return <span className="text-nowrap">Pas de mois précédent à comparer</span>
  const pct = ((current - previous) / previous) * 100
  const up = pct >= 0
  return (
    <>
      <span className={`${up ? 'text-success' : 'text-danger'} me-1`}>
        <IconifyIcon icon={up ? 'ri:arrow-up-line' : 'ri:arrow-down-line'} style={{ marginBottom: '5px', marginRight: '5px' }} />
        {Math.abs(pct).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %
      </span>
      <span className="text-nowrap">vs mois précédent</span>
    </>
  )
}

const Stat = ({ dashboard }: { dashboard: Dashboard }) => {
  const { months, currency } = dashboard
  const last = months[months.length - 1]
  const prev = months[months.length - 2]
  const money = (v: string) => formatMoney({ amount: v, currency })

  const cards = [
    {
      title: 'Transferts (ce mois)',
      value: money(last.transferVolume),
      current: amountOf(last.transferVolume),
      previous: prev ? amountOf(prev.transferVolume) : 0,
      icon: 'solar:wallet-bold-duotone',
      tone: 'success',
      color: '#5ecca7',
      series: seriesOf(months, 'transferVolume'),
    },
    {
      title: 'Recharges (ce mois)',
      value: money(last.topUpVolume),
      current: amountOf(last.topUpVolume),
      previous: prev ? amountOf(prev.topUpVolume) : 0,
      icon: 'solar:cart-bold-duotone',
      tone: 'info',
      color: '#348cd4',
      series: seriesOf(months, 'topUpVolume'),
    },
    {
      title: 'Nouveaux clients (ce mois)',
      value: last.newCustomers.toLocaleString('fr-FR'),
      current: last.newCustomers,
      previous: prev?.newCustomers ?? 0,
      icon: 'solar:user-bold-duotone',
      tone: 'warning',
      color: '#f9c222',
      series: seriesOf(months, 'newCustomers'),
    },
    {
      title: 'Frais perçus (ce mois)',
      value: money(last.fees),
      current: amountOf(last.fees),
      previous: prev ? amountOf(prev.fees) : 0,
      icon: 'solar:graph-up-bold-duotone',
      tone: 'primary',
      color: '#f36977',
      series: seriesOf(months, 'fees'),
    },
  ]

  return (
    <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
      {cards.map((c) => {
        const options = sparkline(c.title, c.color, c.series)
        return (
          <Col key={c.title}>
            <Card>
              <CardBody>
                <div className="d-flex align-items-start gap-2 justify-content-between">
                  <div>
                    <h5 className="text-muted fs-13 fw-bold text-uppercase">{c.title}</h5>
                    <h3 className="mt-2 mb-1 fw-bold">{c.value}</h3>
                    <p className="mb-0 text-muted">
                      <Delta current={c.current} previous={c.previous} />
                    </p>
                  </div>
                  <div className="avatar-lg flex-shrink-0">
                    <span className={`avatar-title bg-${c.tone}-subtle text-${c.tone} rounded fs-28`}>
                      <IconifyIcon icon={c.icon} />
                    </span>
                  </div>
                </div>
              </CardBody>
              <div className="apex-charts">
                <ReactApexChart options={options} series={options.series} height={45} type="area" />
              </div>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}

export default Stat

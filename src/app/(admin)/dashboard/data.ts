import { ApexOptions } from 'apexcharts'
import type { DashboardMonth } from '@/lib/api/types'

/** « 2026-10 » → « oct. 26 ». */
export const monthLabel = (month: string): string => {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
}

export const amountOf = (value: string): number => Number(value) || 0

export type MonthField = 'transferVolume' | 'fees' | 'topUpVolume'

/** Série numérique d'un indicateur mensuel, du plus ancien au plus récent. */
export const seriesOf = (months: DashboardMonth[], field: MonthField | 'newCustomers' | 'transferCount'): number[] =>
  months.map((m) => (typeof m[field] === 'number' ? (m[field] as number) : amountOf(m[field] as string)))

/** Mini-courbe d'une carte de chiffre clé. */
export const sparkline = (name: string, color: string, data: number[]): ApexOptions => ({
  series: [{ name, data }],
  chart: { height: 45, type: 'area', sparkline: { enabled: true }, animations: { enabled: false } },
  colors: [color],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] } },
  tooltip: { enabled: false },
  dataLabels: { enabled: false },
  grid: { show: false },
  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { show: false },
  stroke: { curve: 'smooth', width: 1 },
})

const compact = (v: number) => v.toLocaleString('fr-FR', { notation: 'compact', maximumFractionDigits: 1 })

/** Volumes de transferts et de recharges sur 12 mois. */
export const activityChart = (months: DashboardMonth[], currency: string): ApexOptions => ({
  series: [
    { name: 'Transferts', data: seriesOf(months, 'transferVolume') },
    { name: 'Recharges', data: seriesOf(months, 'topUpVolume') },
  ],
  chart: { height: 300, type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
  stroke: { width: [4, 4], curve: 'smooth', dashArray: [0, 8] },
  dataLabels: { enabled: false },
  markers: { size: 4 },
  colors: ['#02c0ce', '#777edd'],
  legend: { position: 'top' },
  xaxis: { categories: months.map((m) => monthLabel(m.month)) },
  yaxis: { labels: { formatter: (v: number) => compact(v) } },
  tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => `${v.toLocaleString('fr-FR')} ${currency}` } },
})

/** Frais perçus par mois. */
export const feesChart = (months: DashboardMonth[], currency: string): ApexOptions => ({
  series: [{ name: 'Frais perçus', type: 'bar', data: seriesOf(months, 'fees') }],
  chart: { height: 310, type: 'line', toolbar: { show: false } },
  stroke: { width: 0, curve: 'straight' },
  plotOptions: { bar: { columnWidth: '60%', borderRadius: 5, borderRadiusApplication: 'end' } },
  dataLabels: { enabled: false },
  xaxis: { categories: months.map((m) => monthLabel(m.month)) },
  yaxis: { labels: { formatter: (v: number) => compact(v) } },
  tooltip: { y: { formatter: (v: number) => `${v.toLocaleString('fr-FR')} ${currency}` } },
  colors: ['#0acf97'],
})

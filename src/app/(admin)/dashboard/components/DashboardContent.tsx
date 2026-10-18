'use client'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import type { Dashboard } from '@/lib/api/types'
import { Alert } from 'react-bootstrap'
import RecentTransfers from './RecentTransfers'
import Stat from './Stat'
import Statistics from './Statistics'

/** Une seule lecture des agrégats (`/admin/dashboard`), répartie entre les trois blocs de la page. */
const DashboardContent = () => {
  const { data, loading, error } = useFetchData<Dashboard>(API_ENDPOINTS.DASHBOARD)

  if (error) return <Alert variant="danger">Impossible de charger le tableau de bord : {error.message}</Alert>
  if (!data) return loading ? <p className="text-center p-4">Chargement...</p> : null

  return (
    <>
      <Stat dashboard={data} />
      <Statistics dashboard={data} />
      <RecentTransfers dashboard={data} />
    </>
  )
}

export default DashboardContent

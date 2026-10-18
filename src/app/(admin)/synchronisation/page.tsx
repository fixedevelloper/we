import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import SyncCenter from './components/SyncCenter'

export const metadata: Metadata = { title: 'Synchronisation Wace' }

const SynchronisationPage = () => {
  return (
    <>
      <PageTitle title="Synchronisation Wace" subTitle="Banques, opérateurs, codes payeurs et libellés" />
      <SyncCenter />
    </>
  )
}

export default SynchronisationPage

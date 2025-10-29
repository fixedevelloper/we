import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AddRechargeCard from "../components/AddRechargeCard";

export const metadata: Metadata = { title: 'Ajouter une recharge' }

const AddRechargePage = () => {
  return (
    <>
      <PageTitle title="Ajouter une recharge" subTitle="Ajouter" />
      <AddRechargeCard />
    </>
  )
}

export default AddRechargePage

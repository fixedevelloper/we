import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AddTokenCard from "../components/AddTokenCard";

export const metadata: Metadata = { title: 'Ajouter un token' }

const AddTokenPage = () => {
  return (
    <>
      <PageTitle title="Ajouter un token" subTitle="Ajouter" />
      <AddTokenCard />
    </>
  )
}

export default AddTokenPage

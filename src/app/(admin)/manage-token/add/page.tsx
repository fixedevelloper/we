import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AddTokenCard from "../components/AddTokenCard";

export const metadata: Metadata = { title: 'Créer un jeton' }

const AddTokenPage = () => {
  return (
    <>
      <PageTitle title="Créer un jeton" subTitle="Jetons web" />
      <AddTokenCard />
    </>
  )
}

export default AddTokenPage

import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import AddTransactionCard from "../components/AddTransactionCard";

export const metadata: Metadata = { title: 'Ajouter une transaction' }

const AddTransactionPage = () => {
  return (
    <>
      <PageTitle title="Ajouter une transaction" subTitle="Ajouter" />
      <AddTransactionCard />
    </>
  )
}

export default AddTransactionPage

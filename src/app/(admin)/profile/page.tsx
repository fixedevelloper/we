import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import ProfileCard from './components/ProfileCard'

export const metadata: Metadata = { title: 'Mon profil' }

const ProfilePage = () => {
  return (
    <>
      <PageTitle title="Mon profil" subTitle="Compte et sécurité" />
      <ProfileCard />
    </>
  )
}

export default ProfilePage

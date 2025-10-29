
import { StaticImageData } from 'next/image'

import flagsDe from '@/assets/images/flags/de.svg'
import flagsEs from '@/assets/images/flags/es.svg'
import flagsIn from '@/assets/images/flags/in.svg'
import flagsIt from '@/assets/images/flags/it.svg'
import flagsFr from '@/assets/images/flags/fr.svg'
import flagsUs from '@/assets/images/flags/us.svg'


import { addOrSubtractDaysFromDate } from '@/utils/date'
import { ReactNode } from 'react'

export type AppsType = {
  name: string
  image: StaticImageData
}

export type CountryType = {
  image: StaticImageData
  language: string
}

export type NotificationType = {
  id: number
  title: ReactNode
  image?: {
    image: StaticImageData
    icon: string
    variant: string
  }
  icon?: {
    icon: string
    variant: string
  }
  time: Date
}

export type UIComponentsPagesType = {
  title: string
  path: string
}

export type ApplicationsPagesType = {
  title: string
  path: string
}

export const appData: AppsType[] = [

]

export const countryData: CountryType[] = [
  {
    image: flagsUs,
    language: 'English',
  },
  {
    image: flagsFr,
    language: 'Francais',
  },
]

export const notificationData: NotificationType[] = [

]

export const uiComponentPageData: UIComponentsPagesType[] = [
  {
    title: 'Widgets',
    path: '/forms/wizard',
  },
  {
    title: 'Dragula',
    path: '/extended/dragula',
  },
  {
    title: 'Dropdowns',
    path: '/ui/dropdowns',
  },
  {
    title: 'Ratings',
    path: '/extended/ratings',
  },
  {
    title: 'Sweet Alerts',
    path: '/extended/sweet-alert',
  },
  {
    title: 'Scrollbar',
    path: '/extended/scrollbar',
  },
  {
    title: 'Range Slider',
    path: '/forms/slider',
  },
]

export const applicationsPagesData: ApplicationsPagesType[] = [
  {
    title: 'eCommerce Pages',
    path: '/e-commerce/products',
  },
  {
    title: 'Hospital',
    path: '/hospital/doctors',
  },
  {
    title: 'Email',
    path: '/apps/email',
  },
  {
    title: 'Calendar',
    path: '/apps/calendar',
  },
  {
    title: 'Kanban Board',
    path: '',
  },
  {
    title: 'Invoice Management',
    path: '/invoices',
  },
  {
    title: 'Pricing',
    path: '/pricing/pricing-one',
  },
]

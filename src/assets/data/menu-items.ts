import { MenuItemType } from '@/types/menu'
import { Airplay, Box, Calendar, ChartNoAxesColumn,
  CircleAlert, Disc, File, FileText, LayoutGrid,Wallet2,LucideGlobe2,
  Mail, Map, Paintbrush, Share, Sparkles, Table, Users, 
  LucideAlertOctagon,
  LucideCone} from 'lucide-react'


export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'navigation',
    label: 'Navigation',
    isTitle: true,
    roles: []
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: Airplay,
    badge: {
      text: '3',
      variant: 'danger',
    },
    url: '/dashboard',
    roles: []
  },
  {
    key: 'transactions',
    label: 'Transactions',
    isTitle: true,
    roles: []
  },
  {
    key: 'transferts',
    label: 'Transferts',
    icon: Table,
    url: '/transactions',
    roles: []
  },
  {
    key: 'recharges',
    label: 'Recharges',
    icon: Wallet2,
    url: '/recharges',
    roles: []
  },
  {
    key: 'senders',
    label: 'Expediteurs',
    icon: Users,
    url: '/senders',
    roles: []
  },
  {
    key: 'beneficiaries',
    label: 'Beneficiares',
    icon: Users,
    url: '/beneficiaries',
    roles: []
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    isTitle: true,
    roles: []
  },
  {
    key: 'customers',
    label: 'Clients',
    icon: Users,
    url: '/customers',
    roles: []
  },
  {
    key: 'employee',
    label: 'Employes',
    icon: Users,
    url: '/employes',
    roles: []
  },
  {
    key: 'settings',
    label: 'Settings',
    isTitle: true,
    roles: []
  },
  {
    key: 'countries',
    label: 'Pays',
    icon: LucideGlobe2,
    url: '/countries',
    roles: []
  },
  {
    key: 'grille',
    label: 'Grille tarifaire',
    icon: File,
    url: '/grilletarifaires',
    roles: []
  },
  {
    key: 'zones',
    label: 'Zones',
    icon: LucideGlobe2,
    url: '/zones',
    roles: []
  },
    {
    key: 'audits',
    label: 'Audits',
    icon: LucideAlertOctagon,
    url: '/audits',
    roles: []
  },
     {
    key: 'connexions',
    label: 'Connexions',
    icon: LucideCone,
    url: '/connexions',
    roles: []
  },
]
const CUSTOMER_MENU:MenuItemType[]=[
  {
    key: 'navigation',
    label: 'Navigation',
    isTitle: true,
    roles: []
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: Airplay,
    badge: {
      text: '3',
      variant: 'danger',
    },
    url: '/dashboard',
    roles:["ROLE_CUSTOMER", "ROLE_USER"]
  },
]
export const HORIZONTAL_MENU_ITEM: MenuItemType[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'ri:airplay-line',
    url: '/dashboard',
    roles: []
  },
  {
    key: 'apps',
    label: 'Apps',
    icon: 'ri:apps-line',
    children: [
      {
        key: 'calendar',
        label: 'Calendar',
        url: '/calendar',
        parentKey: 'apps',
        roles: []
      },
      {
        key: 'email',
        label: 'Email',
        url: '/email',
        parentKey: 'apps',
        roles: []
      },
      {
        key: 'invoices',
        label: 'Invoice',
        parentKey: 'apps',
        children: [
          {
            key: 'invoices',
            label: 'Invoices',
            url: '/invoices',
            parentKey: 'invoice',
            roles: []
          },
          {
            key: 'view-invoices',
            label: 'View Invoices',
            url: '/invoices/view-invoice',
            parentKey: 'invoice',
            roles: []
          },
          {
            key: 'create-invoices',
            label: 'Create Invoices',
            url: '/invoices/create-invoices',
            parentKey: 'invoice',
            roles: []
          },
        ],
        roles: []
      },
    ],
    roles: []
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'ri:file-text-line',
    children: [
      {
        key: 'auth',
        label: 'Authentication',
        parentKey: 'pages',
        children: [
          {
            key: 'login',
            label: 'Login',
            url: '/auth/login',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'register',
            label: 'Register',
            url: '/auth/register',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'logout',
            label: 'Logout',
            url: '/auth/logout',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'recover-password',
            label: 'Recover Password',
            url: '/auth/recover-password',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'create-password',
            label: 'Create Password',
            url: '/auth/create-password',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'lock-screen',
            label: 'Lock Screen',
            url: '/auth/lock-screen',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'confirm-mail',
            label: 'Confirm Mail',
            url: '/auth/confirm-mail',
            parentKey: 'auth',
            roles: []
          },
          {
            key: 'login-pin',
            label: 'Login with PIN',
            url: '/auth/login-pin',
            parentKey: 'auth',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'errors',
        label: 'Error Pages',
        parentKey: 'pages',
        children: [
          {
            key: 'error-401',
            label: '401 Unauthorized',
            url: '/errors/error-401',
            parentKey: 'errors',
            roles: []
          },
          {
            key: 'error-400',
            label: '400 Bad Reques',
            url: '/errors/error-400',
            parentKey: 'errors',
            roles: []
          },
          {
            key: 'error-403',
            label: '403 Forbidden',
            url: '/errors/error-403',
            parentKey: 'errors',
            roles: []
          },
          {
            key: 'error-404',
            label: '404 Not Found',
            url: '/errors/error-404',
            parentKey: 'errors',
            roles: []
          },
          {
            key: 'error-500',
            label: '500 Internal Server',
            url: '/errors/error-500',
            parentKey: 'errors',
            roles: []
          },
          {
            key: 'service-unavailable',
            label: 'Service Unavailable',
            url: '/errors/service-unavailable',
            parentKey: 'errors',
            roles: []
          },
          {
            key: 'error-404-alt',
            label: 'Error 404 Alt',
            url: '/pages/error-404-alt',
            parentKey: 'pages',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'starter-page',
        label: 'Starter Page',
        url: '/pages/starter-page',
        parentKey: 'pages',
        roles: []
      },
      {
        key: 'faq',
        label: 'FAQ',
        url: '/pages/faq',
        parentKey: 'pages',
        roles: []
      },
      {
        key: 'pricing',
        label: 'Pricing',
        url: '/pages/pricing',
        parentKey: 'pages',
        roles: []
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        url: '/maintenance',
        parentKey: 'pages',
        roles: []
      },
      {
        key: 'timeline',
        label: 'Timeline',
        url: '/pages/timeline',
        parentKey: 'pages',
        roles: []
      },
      {
        key: 'terms',
        label: 'Terms & Conditions',
        url: '/pages/terms',
        parentKey: 'pages',
        roles: []
      },
    ],
    roles: []
  },
  {
    key: 'components',
    label: 'Components',
    icon: 'ri:box-3-line',
    children: [
      {
        key: 'base-ui',
        label: 'Base UI',
        children: [
          {
            key: 'base-ui-accordions',
            label: 'Accordions',
            url: '/ui/accordions',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-alerts',
            label: 'Alerts',
            url: '/ui/alerts',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-avatars',
            label: 'Avatars',
            url: '/ui/avatars',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-badges',
            label: 'Badges',
            url: '/ui/badges',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-breadcrumb',
            label: 'Breadcrumb',
            url: '/ui/breadcrumb',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-buttons',
            label: 'Buttons',
            url: '/ui/buttons',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-cards',
            label: 'Cards',
            url: '/ui/cards',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-carousel',
            label: 'Carousel',
            url: '/ui/carousel',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-collapse',
            label: 'Collapse',
            url: '/ui/collapse',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-dropdowns',
            label: 'Dropdowns',
            url: '/ui/dropdowns',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'ul-ratio',
            label: 'Ratio',
            url: '/ui/ratio',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'ul-grid',
            label: 'Grid',
            url: '/ui/grid',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'ul-links',
            label: 'Links',
            url: '/ui/links',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-list-group',
            label: 'List Group',
            url: '/ui/list-group',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-modals',
            label: 'Modals',
            url: '/ui/modals',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-notifications',
            label: 'Notifications',
            url: '/ui/notifications',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-offcanvas',
            label: 'Offcanvas',
            url: '/ui/offcanvas',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-placeholders',
            label: 'Placeholders',
            url: '/ui/placeholders',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-pagination',
            label: 'Pagination',
            url: '/ui/pagination',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-popovers',
            label: 'Popovers',
            url: '/ui/popovers',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-progress',
            label: 'Progress',
            url: '/ui/progress',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-spinners',
            label: 'Spinners',
            url: '/ui/spinners',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-tabs',
            label: 'Tabs',
            url: '/ui/tabs',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-tooltips',
            label: 'Tooltips',
            url: '/ui/tooltips',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-typography',
            label: 'Typography',
            url: '/ui/typography',
            parentKey: 'base-ui',
            roles: []
          },
          {
            key: 'base-ui-utilities',
            label: 'Utilities',
            url: '/ui/utilities',
            parentKey: 'base-ui',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'extended-ui',
        label: 'Extended UI',
        children: [
          {
            key: 'dragula',
            label: 'Dragula',
            url: '/extended/dragula',
            parentKey: 'extended-ui',
            roles: []
          },
          {
            key: 'sweet-alert',
            label: 'Sweet Alert',
            url: '/extended/sweet-alert',
            parentKey: 'extended-ui',
            roles: []
          },
          {
            key: 'ratings',
            label: 'Ratings',
            url: '/extended/ratings',
            parentKey: 'extended-ui',
            roles: []
          },
          {
            key: 'scrollbar',
            label: 'Scrollbar',
            url: '/extended/scrollbar',
            parentKey: 'extended-ui',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'forms',
        label: 'Forms',
        children: [
          {
            key: 'basic',
            label: 'Basic Elements',
            url: '/forms/basic',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'inputmask',
            label: 'Inputmask',
            url: '/forms/inputmask',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'picker',
            label: 'Picker',
            url: '/forms/picker',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'select',
            label: 'Select',
            url: '/forms/select',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'slider',
            label: 'Range Slider',
            url: '/forms/slider',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'validation',
            label: 'Validation',
            url: '/forms/validation',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'wizard',
            label: 'Wizard',
            url: '/forms/wizard',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'file-uploads',
            label: 'File Uploads',
            url: '/forms/file-uploads',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'editors',
            label: 'Editors',
            url: '/forms/editors',
            parentKey: 'forms',
            roles: []
          },
          {
            key: 'layout',
            label: 'Layouts',
            url: '/forms/layout',
            parentKey: 'forms',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'charts',
        label: 'charts',
        children: [
          {
            key: 'area',
            label: 'area',
            url: '/charts/area',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'bar',
            label: 'Bar',
            url: '/charts/bar',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'bubble',
            label: 'Bubble',
            url: '/charts/bubble',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'candlestick',
            label: 'Candlestick',
            url: '/charts/candlestick',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'column',
            label: 'Column',
            url: '/charts/column',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'heatmap',
            label: 'Heatmap',
            url: '/charts/heatmap',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'line',
            label: 'Line',
            url: '/charts/line',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'mixed',
            label: 'Mixed',
            url: '/charts/mixed',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'timeline-chart',
            label: 'Timeline',
            url: '/charts/timeline',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'boxplot',
            label: 'Boxplot',
            url: '/charts/boxplot',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'treemap',
            label: 'Treemap',
            url: '/charts/treemap',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'pie',
            label: 'Pie',
            url: '/charts/pie',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'radar',
            label: 'Radar',
            url: '/charts/radar',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'radialBar',
            label: 'RadialBar',
            url: '/charts/radialBar',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'scatter',
            label: 'Scatter',
            url: '/charts/scatter',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'polar',
            label: 'Polar Area',
            url: '/charts/polar',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'sparklines',
            label: 'Sparklines',
            url: '/charts/sparklines',
            parentKey: 'charts',
            roles: []
          },
          {
            key: 'slope',
            label: 'Slope',
            url: '/charts/slope',
            parentKey: 'charts',
            badge: {
              text: 'New',
              variant: 'danger',
            },
            roles: []
          },
          {
            key: 'funnel',
            label: 'Funnel',
            url: '/charts/funnel',
            parentKey: 'charts',
            badge: {
              text: 'New',
              variant: 'danger',
            },
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'tables',
        label: 'Tables',
        children: [
          {
            key: 'basic-table',
            label: 'Basic Tables',
            url: '/tables/basic-table',
            parentKey: 'tables',
            roles: []
          },
          {
            key: 'gridJs',
            label: 'GridJs Tables',
            url: '/tables/gridJs',
            parentKey: 'tables',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'icons',
        label: 'Icons',
        children: [
          {
            key: 'remix',
            label: 'Remix',
            url: '/icons/remix',
            parentKey: 'icons',
            roles: []
          },
          {
            key: 'lucide',
            label: 'Lucide',
            url: '/icons/lucide',
            parentKey: 'icons',
            roles: []
          },
          {
            key: 'solar',
            label: 'Solar',
            url: '/icons/solar',
            parentKey: 'icons',
            roles: []
          },
        ],
        roles: []
      },
      {
        key: 'maps',
        label: 'Maps',
        children: [
          {
            key: 'google',
            label: 'Google Maps',
            url: '/maps/google',
            parentKey: 'maps',
            roles: []
          },
          {
            key: 'vector',
            label: 'Vector Maps',
            url: '/maps/vector',
            parentKey: 'maps',
            roles: []
          },
          {
            key: 'leaflet',
            label: 'Leaflet Maps',
            url: '/maps/leaflet',
            parentKey: 'maps',
            roles: []
          },
        ],
        roles: []
      },
    ],
    roles: []
  },
  {
    key: 'layouts',
    label: 'Layouts',
    icon: 'ri:layout-line',
    children: [
      {
        key: 'horizontal',
        label: 'Horizontal',
        url: '/layouts/horizontal',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
      {
        key: 'full-view',
        label: 'Full View',
        url: '/layouts/full-view',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
      {
        key: 'fullscreen-view',
        label: 'FullScreen View',
        url: '/layouts/fullscreen-view',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
      {
        key: 'hover-menu',
        label: 'Hover Menu',
        url: '/layouts/hover-menu',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
      {
        key: 'compact',
        label: 'Compact',
        url: '/layouts/compact',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
      {
        key: 'icon-view',
        label: 'Icon View',
        url: '/layouts/icon-view',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
      {
        key: 'dark-mode',
        label: 'Dark Mode',
        url: '/layouts/dark-mode',
        parentKey: 'layouts',
        target: '_blank',
        roles: []
      },
    ],
    roles: []
  },
]

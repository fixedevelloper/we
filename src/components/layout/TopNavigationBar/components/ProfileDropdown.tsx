import avatar3 from '@/assets/images/logo.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { usePathname } from 'next/navigation'
import {useSession} from "next-auth/react";
import { signOut } from "next-auth/react";
const ProfileDropdown = () => {
  const {data: session, status} = useSession();
  const user = session?.user;
  const pathname = usePathname() ?? '/dashboard'
  return (
    <div className="topbar-item nav-user">
      <Dropdown>
        <DropdownToggle
          as={'a'}
          className="topbar-link drop-arrow-none px-2"
          data-bs-toggle="dropdown"
          data-bs-offset="0,19"
          type="button"
          aria-haspopup="false"
          aria-expanded="false">
          <Image src={avatar3} width={32} className="rounded-circle me-lg-2 d-flex" alt="user-image" />
          <span className="d-lg-flex flex-column gap-1 d-none">
            <span className="fw-semibold">{user?.name}</span>
          </span>
          <IconifyIcon icon="ri:arrow-down-s-line" className="d-none d-lg-block align-middle ms-2" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownHeader className="noti-title">
            <h6 className="text-overflow m-0">{user?.email ?? 'Bienvenue'}</h6>
          </DropdownHeader>
          <DropdownItem as={Link} href="/profile">
            <IconifyIcon icon="ri:account-circle-line" className=" me-1 fs-16 align-middle" />
            <span className="align-middle">Mon profil</span>
          </DropdownItem>
          <DropdownItem as={Link} href="/settings">
            <IconifyIcon icon="ri:settings-2-line" className=" me-1 fs-16 align-middle" />
            <span className="align-middle">Paramètres</span>
          </DropdownItem>
          <div className="dropdown-divider" />
          <DropdownItem as={Link} href={`/auth/lock-screen?from=${encodeURIComponent(pathname)}`}>
            <IconifyIcon icon="ri:lock-line" className="me-1 fs-16 align-middle" />
            <span className="align-middle">Verrouiller</span>
          </DropdownItem>
          <DropdownItem  onClick={() => signOut({ callbackUrl: "/" })} className="active fw-semibold text-danger">
            <IconifyIcon icon="ri:logout-box-line" className="me-1 fs-16 align-middle" />
            <span className="align-middle">Se déconnecter</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default ProfileDropdown

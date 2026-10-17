import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { isBackofficeUser, isRoleAllowed } from '@/assets/data/route-roles'

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Le back-office est réservé au personnel (l'API refuse de toute façon les autres).
    if (!isBackofficeUser(request.nextauth?.token?.roles)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Contrôle de rôle côté serveur (voir assets/data/route-roles.ts)
    const roles = request.nextauth?.token?.roles
    if (!isRoleAllowed(pathname, roles)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  },
  {
    pages: { signIn: '/auth/login' },
  },
)

// Protège toutes les routes sauf l'auth, l'API NextAuth et les assets statiques
export const config = {
  matcher: ['/((?!auth|api/auth|_next/static|_next/image|favicon.ico|images|assets).*)'],
}

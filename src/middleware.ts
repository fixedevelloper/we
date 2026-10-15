import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    if (request.nextUrl.pathname === '/') {
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

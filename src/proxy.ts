import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const accessCookie = request.cookies.get('ocean_access')

  if (accessCookie?.value === 'WhoIsCher') {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/gate', request.url))
}

export const config = {
  matcher: ['/((?!gate|_next|favicon\\.ico).*)'],
}

import { NextRequest, NextResponse } from 'next/server'

// ── Rate-limiting types & state ───────────────────────────────────────────────

interface RateWindow {
  count: number
  start: number
}

interface RateLimit {
  max: number
  windowMs: number
}

// Per-IP sliding-window counters (single process / single region).
const windows = new Map<string, RateWindow>()

const LIMITS: Record<string, RateLimit> = {
  '/api/submit':   { max: 10, windowMs: 10 * 60 * 1000 }, // 10 / 10 min
  '/api/evaluate': { max: 5,  windowMs:      60 * 1000 }, //  5 /  1 min
  '/api/email':    { max: 10, windowMs: 60 * 60 * 1000 }, // 10 /  1 hr
}

function getRateLimit(pathname: string): RateLimit | null {
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix)) return limit
  }
  return null
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Access gate — skip for /gate, /_next/*, /favicon.ico
  const isExcluded =
    pathname.startsWith('/gate') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  if (!isExcluded) {
    const accessCookie = request.cookies.get('ocean_access')
    if (accessCookie?.value !== 'WhoIsCher') {
      return NextResponse.redirect(new URL('/gate', request.url))
    }
  }

  // 2. Rate limiting on API routes
  const limit = getRateLimit(pathname)
  if (limit) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const key = `${ip}:${pathname}`
    const now = Date.now()

    const win = windows.get(key)
    if (!win || now - win.start > limit.windowMs) {
      windows.set(key, { count: 1, start: now })
    } else {
      win.count++
      if (win.count > limit.max) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 },
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes; gate exclusions are handled inside the function.
  matcher: ['/((?!_next/static|_next/image).*)'],
}

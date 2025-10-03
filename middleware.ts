import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Content Security Policy configuration
function getCSP() {
  const csp = []

  // Default source - only allow from same origin
  csp.push("default-src 'self'")

  // Script sources - Next.js requires 'unsafe-eval' in dev, 'unsafe-inline' for inline scripts
  // Allow Intercom, Sentry, and Vercel scripts
  csp.push(
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
      '*.intercom.io *.intercomcdn.com *.intercomassets.com ' +
      '*.sentry.io *.sentry-cdn.com ' +
      'vercel.live *.vercel-scripts.com'
  )

  // Style sources - Relaxed for UI as requested
  // Allow inline styles, Google Fonts, and external stylesheets
  csp.push(
    "style-src 'self' 'unsafe-inline' " +
      'fonts.googleapis.com ' +
      '*.intercomcdn.com *.intercomassets.com'
  )

  // Font sources - Google Fonts and data URIs
  csp.push("font-src 'self' data: fonts.gstatic.com *.intercomcdn.com")

  // Image sources - Allow from various sources for flexibility
  csp.push(
    "img-src 'self' data: https: blob: " +
      '*.intercom.io *.intercomcdn.com *.intercomassets.com *.intercomusercontent.com ' +
      '*.supabase.co *.supabase.in ' +
      'vercel.live *.vercel.app'
  )

  // Connect sources - API calls to external services
  // Supabase, Intercom, Sentry, Vercel, and AWS SES (if needed)
  csp.push(
    "connect-src 'self' " +
      '*.supabase.co *.supabase.in ' +
      '*.intercom.io *.intercomcdn.com api.intercom.io api.au.intercom.io api.eu.intercom.io ' +
      'wss://*.intercom.io ' + // WebSocket for Intercom real-time messaging
      '*.sentry.io o4508561652457472.ingest.*.sentry.io ' +
      'vercel.live vitals.vercel-insights.com *.vercel-scripts.com ' +
      'email.*.amazonaws.com' // AWS SES regions
  )

  // Frame sources - Allow Intercom chat widget and Vercel preview frames
  csp.push(
    "frame-src 'self' " +
      '*.intercom.io *.intercom-messenger.com ' +
      'vercel.live *.vercel.app'
  )

  // Worker sources - For service workers and web workers
  csp.push("worker-src 'self' blob:")

  // Manifest source
  csp.push("manifest-src 'self'")

  // Media sources
  csp.push(
    "media-src 'self' blob: " +
      '*.intercom.io *.intercomcdn.com *.intercomassets.com'
  )

  // Base URI restriction
  csp.push("base-uri 'self'")

  // Form action restriction
  csp.push("form-action 'self'")

  // Frame ancestors - Prevent clickjacking
  csp.push("frame-ancestors 'none'")

  // Object source - Restrict plugins
  csp.push("object-src 'none'")

  // Upgrade insecure requests in production
  if (process.env.NODE_ENV === 'production') {
    csp.push('upgrade-insecure-requests')
  }

  return csp.join('; ')
}

export async function middleware(request: NextRequest) {
  // Get the response from Supabase middleware
  const response = await updateSession(request)

  // Clone the response to add CSP headers
  const responseWithCSP = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Copy all headers from the original response
  response.headers.forEach((value, key) => {
    responseWithCSP.headers.set(key, value)
  })

  // Copy cookies from the original response
  response.cookies.getAll().forEach((cookie) => {
    responseWithCSP.cookies.set(cookie)
  })

  // Add Content Security Policy header
  responseWithCSP.headers.set('Content-Security-Policy', getCSP())

  // Add additional security headers
  responseWithCSP.headers.set('X-Frame-Options', 'DENY')
  responseWithCSP.headers.set('X-Content-Type-Options', 'nosniff')
  responseWithCSP.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  )
  responseWithCSP.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return responseWithCSP
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

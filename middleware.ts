import { type NextRequest, NextResponse, userAgent } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Generate a unique nonce per request for CSP (Edge Runtime compatible)
  const nonce = crypto.randomUUID().replace(/-/g, '')

  const isDev = process.env.NODE_ENV === 'development'

  // Environment-based domain configuration
  const vercelUrl = process.env.VERCEL_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL

  // Extract Supabase host for specific domain allowlist
  const supabaseHost = (() => {
    try {
      return supabaseUrl ? new URL(supabaseUrl).host : undefined
    } catch {
      return undefined
    }
  })()

  // Core application domains
  const appDomains = [
    "'self'",
    ...(vercelUrl ? [`https://${vercelUrl}`] : []),
    'https://*.vercel.app',
    ...(dashboardUrl ? [dashboardUrl] : []),
  ].filter(Boolean as unknown as (value: string) => value is string)

  // Supabase domains (API + Realtime WebSocket)
  const supabaseDomains = [
    'https://*.supabase.co',
    ...(supabaseHost ? [`https://${supabaseHost}`] : []),
  ].filter(Boolean as unknown as (value: string) => value is string)

  // Intercom chat widget domains
  const intercomDomains = [
    'https://widget.intercom.io',
    'https://js.intercomcdn.com',
    'https://api-iam.intercom.io',
    'https://app.intercom.com',
    'https://*.intercom.io',
    'https://*.intercomcdn.com',
  ]

  // Sentry error monitoring
  const sentryDomains = [
    'https://o4509794712158208.ingest.us.sentry.io',
    'https://*.sentry.io',
  ]

  // Google Fonts
  const fontDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]

  // Build comprehensive CSP
  const cspHeader = `
    default-src 'self' ${appDomains.join(' ')} ${supabaseDomains.join(' ')};
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${
      isDev ? "'unsafe-eval' 'unsafe-inline'" : "'wasm-unsafe-eval'"
    } ${appDomains.join(' ')} ${supabaseDomains.join(' ')} ${intercomDomains.join(
      ' '
    )} ${sentryDomains.join(' ')};
    style-src 'self' 'unsafe-inline' blob: data: https:;
    style-src-elem 'self' 'unsafe-inline' blob: data: https: ${fontDomains.join(
      ' '
    )};
    style-src-attr 'unsafe-inline';
    font-src 'self' data: ${fontDomains.join(' ')};
    img-src 'self' blob: data: https: ${supabaseDomains.join(' ')} ${intercomDomains.join(
      ' '
    )};
    connect-src 'self' ${
      // Supabase HTTPS + WebSocket connections
      [
        ...supabaseDomains,
        'wss://*.supabase.co',
        supabaseHost ? `wss://${supabaseHost}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    } ${intercomDomains.join(' ')} wss://nexus-websocket-a.intercom.io wss://nexus-websocket-b.intercom.io ${sentryDomains.join(
      ' '
    )} ${appDomains.join(' ')};
    frame-src 'self' ${intercomDomains.join(' ')};
    child-src 'self' blob: ${intercomDomains.join(' ')};
    worker-src 'self' blob:;
    media-src 'self' blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' ${dashboardUrl || ''};
    frame-ancestors 'none';
    manifest-src 'self';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()

  // First, let Supabase manage cookies/session
  const supabaseResponse = await updateSession(request)

  // Extract user-agent information for analytics/logging
  const { isBot, browser, device, engine, os, cpu } = userAgent(request)

  // Prepare request headers with nonce, CSP, and user-agent data
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
  requestHeaders.set('x-ua-is-bot', String(isBot))
  requestHeaders.set('x-ua-browser-name', browser.name ?? '')
  requestHeaders.set('x-ua-browser-version', browser.version ?? '')
  requestHeaders.set('x-ua-device-model', device.model ?? '')
  requestHeaders.set('x-ua-device-type', device.type ?? 'desktop')
  requestHeaders.set('x-ua-device-vendor', device.vendor ?? '')
  requestHeaders.set('x-ua-engine-name', engine.name ?? '')
  requestHeaders.set('x-ua-engine-version', engine.version ?? '')
  requestHeaders.set('x-ua-os-name', os.name ?? '')
  requestHeaders.set('x-ua-os-version', os.version ?? '')
  requestHeaders.set('x-ua-cpu-arch', cpu.architecture ?? '')

  // Create response with enriched headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Copy Supabase cookies into our response
  for (const cookie of supabaseResponse.cookies.getAll()) {
    // next/server allows setting via cookie object overload
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    response.cookies.set(cookie)
  }

  // Set CSP and additional security headers on the response
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Add HSTS header in production with HTTPS
  if (!isDev && request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}

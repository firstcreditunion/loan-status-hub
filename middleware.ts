import { type NextRequest, NextResponse, userAgent } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Generate a unique nonce per request for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const isDev = process.env.NODE_ENV === 'development'

  // Vercel env domain (preview/prod) and broad Vercel allowance
  const vercelUrl = process.env.VERCEL_URL

  // Supabase project-specific and wildcard domains (include wss for realtime)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHost = (() => {
    try {
      return supabaseUrl ? new URL(supabaseUrl).host : undefined
    } catch {
      return undefined
    }
  })()

  // Base allowlist
  const allowedDomains = [
    "'self'",
    // Example project's explicit Vercel app plus env-driven and wildcard Vercel
    'https://term-deposit-calculator-dev.vercel.app',
    ...(vercelUrl ? [`https://${vercelUrl}`] : []),
    'https://*.vercel.app',
    // AddressFinder API
    'https://api.addressfinder.io',
    // Supabase HTTPS endpoints (wildcard + project specific)
    'https://*.supabase.co',
    ...(supabaseHost ? [`https://${supabaseHost}`] : []),
  ].filter(Boolean as unknown as (value: string) => value is string)

  // Google and fonts
  const googleDomains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://tagmanager.google.com',
    'https://www.gstatic.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.google.com',
    'https://google.com',
    'https://ajax.googleapis.com', // jQuery CDN
  ]

  // Third-party services
  const thirdPartyDomains = [
    // Credit Sense CDN (RackCDN) and iframe domains
    'https://6dadc58e31982fd9f0be-d4a1ccb0c1936ef2a5b7f304db75b8a4.ssl.cf4.rackcdn.com',
    'https://*.ssl.cf4.rackcdn.com',
    'https://creditsense.com.au',
    'https://*.creditsense.com.au',
  ]

  // Tracking/ads
  const trackingDomains = [
    // LinkedIn
    'https://px.ads.linkedin.com',
    'https://*.ads.linkedin.com',
    'https://www.linkedin.com',
    'https://linkedin.com',
    // Google Ads / DoubleClick
    'https://googleads.g.doubleclick.net',
    'https://stats.g.doubleclick.net',
    'https://*.doubleclick.net',
    'https://doubleclick.net',
    'https://www.googleadservices.com',
    'https://googleadservices.com',
    'https://*.googleadservices.com',
    'https://googlesyndication.com',
    'https://*.googlesyndication.com',
    'https://www.google.co.nz',
    'https://google.co.nz',
    // Facebook
    'https://connect.facebook.net',
    'https://*.facebook.net',
    'https://www.facebook.com',
    'https://facebook.com',
    'https://*.facebook.com',
    'https://www.fbcdn.net',
    'https://fbcdn.net',
    'https://*.fbcdn.net',
  ]

  // Build CSP
  const cspHeader = `
    default-src 'self' ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${
      isDev ? "'unsafe-eval' 'unsafe-inline'" : "'wasm-unsafe-eval'"
    } ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline' blob: data: https: ${allowedDomains.join(
      ' '
    )} ${googleDomains.join(' ')} ${thirdPartyDomains.join(
      ' '
    )} ${trackingDomains.join(' ')};
    style-src-elem 'self' 'nonce-${nonce}' 'unsafe-inline' blob: data: https: ${allowedDomains.join(
      ' '
    )} ${googleDomains.join(' ')} ${thirdPartyDomains.join(
      ' '
    )} ${trackingDomains.join(' ')};
    style-src-attr 'unsafe-inline';
    img-src 'self' blob: data: ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    font-src 'self' data: ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    connect-src 'self' ${
      // Supabase realtime (wss) and HTTPS APIs
      [
        'wss://*.supabase.co',
        supabaseHost ? `wss://${supabaseHost}` : '',
        supabaseHost ? `https://${supabaseHost}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    } ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    media-src 'self' ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    worker-src 'self' blob: ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    child-src 'self' ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    frame-src 'self' ${allowedDomains.join(' ')} ${googleDomains.join(
      ' '
    )} ${thirdPartyDomains.join(' ')} ${trackingDomains.join(' ')};
    object-src 'none';
    base-uri 'self';
    form-action 'self' ${allowedDomains.join(' ')};
    frame-ancestors 'none';
    manifest-src 'self' ${allowedDomains.join(' ')};
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `

  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()

  // First, let Supabase manage cookies/session
  const supabaseResponse = await updateSession(request)

  // Extract user-agent information
  const { isBot, browser, device, engine, os, cpu } = userAgent(request)

  if (request.nextUrl.pathname === '/') {
    // console.log('[UA] Homepage visit', {
    //   isBot,
    //   browser,
    //   device,
    //   engine,
    //   os,
    //   cpu,
    // })
  }

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

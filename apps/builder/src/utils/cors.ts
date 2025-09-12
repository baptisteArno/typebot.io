import { NextRequest, NextResponse } from 'next/server'

export function corsMiddleware(request: NextRequest, response: NextResponse) {
  // Get the origin from the request
  const origin = request.headers.get('origin')

  // Get allowed origins from environment variable for external origins
  const allowedOriginsEnv = process.env.NEXT_PUBLIC_EMBEDDED_AUTH_ALLOWED_ORIGIN
  const externalOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
    : []

  // Only include localhost in non-production environments
  const isProduction = process.env.NODE_ENV === 'production'
  const developmentOrigins = !isProduction ? ['http://localhost:3000'] : []

  // Get the app's own origin from NEXTAUTH_URL
  const appOwnOrigin = process.env.NEXTAUTH_URL
  const appOrigins = appOwnOrigin ? [appOwnOrigin] : []

  // Combine all allowed origins for CORS
  const allAllowedOrigins = [
    ...developmentOrigins,
    ...appOrigins,
    ...externalOrigins,
  ]

  console.log(
    `🌐 CORS: Request from origin: ${origin}, environment: ${
      process.env.NODE_ENV
    }, allowed: ${allAllowedOrigins.join(', ')}`
  )

  // For CSP frame-ancestors, we want to allow the app's own origin plus external origins
  // 'self' covers same-origin, but we also explicitly add the app's own URL and external origins
  // In development, also include localhost
  const frameAncestorOrigins = [
    ...developmentOrigins,
    ...appOrigins,
    ...externalOrigins,
  ]
  const allowedOriginsForCSP =
    frameAncestorOrigins.length > 0 ? frameAncestorOrigins.join(' ') : ''

  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set(
    'Content-Security-Policy',
    `frame-ancestors 'self' ${allowedOriginsForCSP}`.trim()
  )
  console.log(`🔒 CSP: Set frame-ancestors to 'self' ${allowedOriginsForCSP}`)

  // Check if the origin is allowed for CORS
  if (origin && allAllowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    console.log(`✅ CORS: Allowed origin ${origin}`)
  } else {
    // For same-origin requests (no origin) or unauthorized origins, don't set CORS headers
    if (!origin) {
      console.log(
        `🏠 CORS: Same-origin request (direct access) - no CORS headers needed`
      )
    } else {
      console.warn(
        `❌ CORS: Blocked request from unauthorized origin: ${origin}`
      )
    }
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )

  return response
}

export function handleCors(request: NextRequest) {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    return corsMiddleware(request, response)
  }

  // For other requests, continue and add CORS headers
  const response = NextResponse.next()
  return corsMiddleware(request, response)
}

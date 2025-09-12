import { NextRequest, NextResponse } from 'next/server'

export function corsMiddleware(request: NextRequest, response: NextResponse) {
  // Get the origin from the request
  const origin = request.headers.get('origin')

  // Get allowed origins from environment variable
  const allowedOriginsEnv = process.env.NEXT_PUBLIC_EMBEDDED_AUTH_ALLOWED_ORIGIN
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000']

  console.log(
    `🌐 CORS: Request from origin: ${origin}, allowed: ${allowedOrigins.join(
      ', '
    )}`
  )

  // Set CSP headers with allowed origins for frame-ancestors
  const allowedOriginsForCSP = allowedOrigins.join(' ')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set(
    'Content-Security-Policy',
    `frame-ancestors 'self' ${allowedOriginsForCSP}`
  )
  console.log(`🔒 CSP: Set frame-ancestors to 'self' ${allowedOriginsForCSP}`)

  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
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

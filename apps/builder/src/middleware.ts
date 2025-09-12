import { NextRequest } from 'next/server'
import { handleCors } from './utils/cors'

export function middleware(request: NextRequest) {
  // Handle CORS for all requests
  return handleCors(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

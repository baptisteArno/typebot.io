import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest): NextResponse {
  if (req.nextUrl.href.includes('/_next/'))
    return NextResponse.rewrite(
      req.nextUrl.href.replace('/_next/', '/embed/builder/_next/'),
    );

  return NextResponse.next();
}
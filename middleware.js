import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export default function middleware(request) {
  const enabled = true;
  if (!enabled) {
    return;
  }

  // Only allow requests to proceed, do not rewrite or redirect for locale
  // The locale will be determined from the cookie in the app logic
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
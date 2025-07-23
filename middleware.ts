import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to login
  if (!session && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If has session and trying to access login, redirect to dashboard
  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

// Specify which routes to run the middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

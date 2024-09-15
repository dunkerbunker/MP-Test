import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "../lib/auth"; // Adjust the path to your auth utility

export async function middleware(req: NextRequest) {
  // Clone the URL object to manipulate it
  const url = req.nextUrl.clone();

  // Validate the session using NextRequest
  const session = await validateSession(req);

  // If the session is invalid, redirect to the login page
  if (!session && !url.pathname.startsWith("/login")) {
    url.pathname = "/login"; // Redirect to login page
    return NextResponse.redirect(url);
  }

  // If the session is valid, continue to the requested page
  return NextResponse.next();
}

// Apply middleware to all routes except for login, API routes, and public assets (favicon, _next)
export const config = {
  matcher: ["/", "/((?!api|login|_next|favicon.ico).*)"],
};

// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routeRules } from "./routeRules";

export default function proxy(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // Determine route rule
  const matchedRoute = Object.keys(routeRules).find(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const rule = matchedRoute ? routeRules[matchedRoute] : "public";

  // If user is logged in and tries to visit a public route → go to dashboard
  if (rule === "public" && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  //  If user is not logged in and tries to visit protected route → go to login
  if (rule === "protected" && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

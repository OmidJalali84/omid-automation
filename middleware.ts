// middleware.ts - Add this file to the root of your project
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// Routes that require authentication
const protectedRoutes = ["/admin-panel", "/admin-login"];
const publicRoutes = [
  "/login",
  "/",
  "/free-order",
  "/menu",
  "/checkout",
  "/dashboard",
  "/orders",
  "/order-detail",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Admin login page should be accessible
  if (pathname === "/admin-login") {
    return NextResponse.next();
  }

  // Check for admin token in cookie
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    console.log("❌ No admin token found, redirecting to login");
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, secret);

    if (
      !payload.restaurantId ||
      !payload.username ||
      payload.role !== "admin"
    ) {
      console.log("❌ Invalid token payload");
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    // Token is valid, allow access
    console.log("✅ Admin authenticated:", payload.username);
    return NextResponse.next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);

    // Clear invalid cookie
    const response = NextResponse.redirect(
      new URL("/admin-login", request.url)
    );
    response.cookies.delete("admin_token");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// lib/middleware/auth.ts
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

// ✅ FIXED Issue #5: No fallback secret
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable must be set");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthPayload {
  username: string;
  restaurantId: string;
  role: string;
}

export async function verifyAuth(
  request: NextRequest
): Promise<AuthPayload | null> {
  try {
    // ✅ FIXED Issue #2: Read from httpOnly cookie instead of Authorization header
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    // ✅ Use jose for verification (more secure than jsonwebtoken)
    const { payload } = await jwtVerify(token, secret);

    // ✅ Validate payload structure
    if (
      !payload.username ||
      !payload.restaurantId ||
      payload.role !== "admin"
    ) {
      console.warn("⚠️ Invalid token payload structure");
      return null;
    }

    return {
      username: payload.username as string,
      restaurantId: payload.restaurantId as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const auth = await verifyAuth(request);

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, context, auth);
  };
}

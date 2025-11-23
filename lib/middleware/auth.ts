// lib/middleware/auth.ts
import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthPayload {
  username: string;
  restaurantId: string;
  role: string;
}

export async function verifyAuth(
  request: NextRequest
): Promise<AuthPayload | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, JWT_SECRET) as AuthPayload;

    return decoded;
  } catch (error) {
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

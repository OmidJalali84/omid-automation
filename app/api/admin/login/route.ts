// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { compare } from "bcryptjs";
import { findAdminByUsername } from "@/lib/db/kv";

// ✅ FIXED Issue #5: No fallback, fail if not set
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable must be set");
}

const secret = new TextEncoder().encode(JWT_SECRET);

// ✅ Added: Rate limiting state (in-memory, should use Redis in production)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempts.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // ✅ FIXED Issue #14: Input validation
    if (!username || typeof username !== "string" || username.length > 100) {
      return NextResponse.json({ message: "ورودی نامعتبر" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length > 200) {
      return NextResponse.json({ message: "ورودی نامعتبر" }, { status: 400 });
    }

    // ✅ FIXED Issue #8: Rate limiting
    const clientIp =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(`login:${clientIp}:${username}`)) {
      console.warn(`⚠️ Rate limit exceeded for ${username} from ${clientIp}`);
      return NextResponse.json(
        { message: "تلاش‌های زیادی انجام شده. لطفاً 15 دقیقه صبر کنید" },
        { status: 429 }
      );
    }

    const admin = await findAdminByUsername(username);

    // ✅ FIXED Issue #15: Generic error message (don't reveal if user exists)
    if (!admin) {
      console.warn(
        `⚠️ Failed login attempt for non-existent user: ${username}`
      );
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      console.warn(`⚠️ Failed login attempt for ${username} - wrong password`);
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // ✅ FIXED Issue #22: Security logging
    console.log(
      `✅ Successful login: ${username} at ${new Date().toISOString()}`
    );

    // Generate JWT token using jose
    const token = await new SignJWT({
      username: admin.username,
      restaurantId: admin.restaurantId,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // ✅ FIXED Issue #2: Use httpOnly cookie instead of returning token
    const response = NextResponse.json({
      success: true,
      restaurantId: admin.restaurantId,
      restaurantName: admin.restaurantName,
      username: admin.username,
    });

    // Set httpOnly cookie - cannot be accessed by JavaScript
    response.cookies.set("admin_token", token, {
      httpOnly: true, // ✅ Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in production
      sameSite: "strict", // ✅ CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    // ✅ FIXED Issue #15: Don't leak error details
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "خطا در ورود به سیستم" },
      { status: 500 }
    );
  }
}

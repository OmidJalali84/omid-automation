// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";
import { findAdminByUsername } from "@/lib/db/kv";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    const admin = await findAdminByUsername(username);

    if (!admin) {
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      {
        username: admin.username,
        restaurantId: admin.restaurantId,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      token,
      restaurantId: admin.restaurantId,
      restaurantName: admin.restaurantName,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "خطا در ورود به سیستم" },
      { status: 500 }
    );
  }
}

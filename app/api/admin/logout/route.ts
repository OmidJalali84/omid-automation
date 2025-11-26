// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "با موفقیت خارج شدید",
  });

  // Clear the admin token cookie
  response.cookies.delete("admin_token");

  return response;
}

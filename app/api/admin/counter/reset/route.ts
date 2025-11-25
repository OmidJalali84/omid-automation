// app/api/admin/counter/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { resetDailyCounter, getOrderCounter } from "@/lib/db/kv";

// GET: Check current counter status
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const counter = await getOrderCounter();
    return NextResponse.json({
      success: true,
      counter,
      info: "Counter resets automatically at midnight each day",
    });
  } catch (error) {
    console.error("Failed to get counter status:", error);
    return NextResponse.json(
      { error: "Failed to get counter status" },
      { status: 500 }
    );
  }
}

// POST: Manually reset counter (admin only)
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await resetDailyCounter();
    const newCounter = await getOrderCounter();

    return NextResponse.json({
      success: true,
      message: "Counter reset successfully",
      counter: newCounter,
    });
  } catch (error) {
    console.error("Failed to reset counter:", error);
    return NextResponse.json(
      { error: "Failed to reset counter" },
      { status: 500 }
    );
  }
}

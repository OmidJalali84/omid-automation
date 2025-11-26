// app/api/roadmap/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRoadmapStatus, toggleRoadmapTask } from "@/lib/db/kv";
import { verifyAuth } from "@/lib/middleware/auth";

// ✅ FIXED Issue #19: GET can be public (read-only)
export async function GET() {
  try {
    const statuses: Record<string, boolean> = await getRoadmapStatus();
    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Failed to load roadmap task statuses:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری وضعیت" },
      { status: 500 }
    );
  }
}

// ✅ FIXED Issue #19: POST requires authentication
export async function POST(request: NextRequest) {
  // ✅ Require authentication - only admins can modify roadmap
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phaseId, taskIdx, itemIdx } = body ?? {};

    // ✅ FIXED Issue #14: Validate input
    if (
      typeof phaseId !== "number" ||
      typeof taskIdx !== "number" ||
      typeof itemIdx !== "number"
    ) {
      return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
    }

    const key = `${phaseId}-${taskIdx}-${itemIdx}`;
    const result: { status: boolean } = await toggleRoadmapTask(key);

    // ✅ FIXED Issue #22: Security logging
    console.log(
      `✅ Roadmap task ${key} toggled to ${result.status} by ${auth.username}`
    );

    return NextResponse.json({ key, status: result.status });
  } catch (error) {
    console.error("Failed to toggle roadmap task status:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی وضعیت" },
      { status: 500 }
    );
  }
}

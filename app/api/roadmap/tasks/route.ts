// app/api/roadmap/tasks/route.ts
import { NextResponse } from "next/server";
import { getRoadmapStatus, toggleRoadmapTask } from "@/lib/db/kv";

export async function GET() {
  try {
    const statuses: Record<string, boolean> = await getRoadmapStatus();
    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Failed to load roadmap task statuses:", error);
    return NextResponse.json(
      { error: "Unable to load task statuses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phaseId, taskIdx, itemIdx } = body ?? {};

    if (
      typeof phaseId !== "number" ||
      typeof taskIdx !== "number" ||
      typeof itemIdx !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const key = `${phaseId}-${taskIdx}-${itemIdx}`;
    const result: { status: boolean } = await toggleRoadmapTask(key);

    return NextResponse.json({ key, status: result.status });
  } catch (error) {
    console.error("Failed to toggle roadmap task status:", error);
    return NextResponse.json(
      { error: "Unable to update task status" },
      { status: 500 }
    );
  }
}

// app/api/init-data/route.ts
// ⚠️ DELETE THIS FILE AFTER RUNNING ONCE!
import { NextResponse } from "next/server";
import { initializeData } from "@/lib/db/kv";

export async function POST(request: Request) {
  try {
    // Optional: Add a secret key check for security
    const { secret } = await request.json();

    if (secret !== process.env.INIT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeData();

    return NextResponse.json({
      success: true,
      message: "Data initialized successfully. Please delete this endpoint!",
    });
  } catch (error: any) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize data" },
      { status: 500 }
    );
  }
}

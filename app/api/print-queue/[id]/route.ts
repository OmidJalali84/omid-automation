// app/api/print-queue/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { removeFromPrintQueue } from "@/lib/db/kv";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await removeFromPrintQueue(id);

    console.log(`🗑️ Removed order ${id} from print queue`);

    return NextResponse.json({
      success: true,
      message: "Order removed from print queue",
    });
  } catch (error: any) {
    console.error("Failed to remove from print queue:", error);

    if (error.message === "Order not found in print queue") {
      return NextResponse.json(
        { error: "Order not found in print queue" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove from print queue" },
      { status: 500 }
    );
  }
}

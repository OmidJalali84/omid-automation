// app/api/print-queue/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { removeFromPrintQueue, getPrintQueue } from "@/lib/db/kv";
import { verifyAuth } from "@/lib/middleware/auth";

// ✅ Print server API key authentication
const PRINT_SERVER_API_KEY = process.env.PRINT_SERVER_API_KEY;

function verifyPrintServerAuth(request: NextRequest): boolean {
  if (!PRINT_SERVER_API_KEY) {
    return false;
  }
  const apiKey = request.headers.get("x-api-key");
  return apiKey === PRINT_SERVER_API_KEY;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Check for either admin auth or print server API key
    const auth = await verifyAuth(request);
    const isPrintServer = verifyPrintServerAuth(request);

    if (!auth && !isPrintServer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // ✅ If admin, verify they have access to this order's restaurant
    if (auth && !isPrintServer) {
      const queue = await getPrintQueue();
      const orderInQueue = queue.find((item: any) => item.id === id);

      if (orderInQueue && orderInQueue.restaurantId !== auth.restaurantId) {
        console.warn(
          `⚠️ Unauthorized print queue deletion attempt by ${auth.username} for ${id}`
        );
        return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
      }
    }

    await removeFromPrintQueue(id);

    if (auth) {
      console.log(
        `✅ Order ${id} removed from print queue by ${auth.username}`
      );
    } else {
      console.log(`✅ Order ${id} removed from print queue by print server`);
    }

    return NextResponse.json({
      success: true,
      message: "سفارش از صف چاپ حذف شد",
    });
  } catch (error: any) {
    console.error("Failed to remove from print queue:", error);

    if (error.message === "Order not found in print queue") {
      return NextResponse.json(
        { error: "سفارش در صف چاپ یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "خطا در حذف از صف چاپ" },
      { status: 500 }
    );
  }
}

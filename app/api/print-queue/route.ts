// app/api/print-queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPrintQueue, addToPrintQueue } from "@/lib/db/kv";
import { verifyAuth } from "@/lib/middleware/auth";

// ✅ Print queue should be accessible only by print servers and admins
// For print servers, we'll use API key authentication
const PRINT_SERVER_API_KEY = process.env.PRINT_SERVER_API_KEY;

function verifyPrintServerAuth(request: NextRequest): boolean {
  if (!PRINT_SERVER_API_KEY) {
    console.warn(
      "⚠️ PRINT_SERVER_API_KEY not set - print queue access disabled"
    );
    return false;
  }

  const apiKey = request.headers.get("x-api-key");
  return apiKey === PRINT_SERVER_API_KEY;
}

export async function GET(request: NextRequest) {
  try {
    // ✅ Check for either admin auth or print server API key
    const auth = await verifyAuth(request);
    const isPrintServer = verifyPrintServerAuth(request);

    if (!auth && !isPrintServer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    let queue: any[] = await getPrintQueue();

    // Filter by restaurant if provided
    if (restaurantId) {
      // ✅ Verify access if admin
      if (auth && auth.restaurantId !== restaurantId) {
        return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
      }

      queue = queue.filter((item: any) => item.restaurantId === restaurantId);
    } else if (auth) {
      // If admin without restaurantId param, filter by their restaurant
      queue = queue.filter(
        (item: any) => item.restaurantId === auth.restaurantId
      );
    }

    return NextResponse.json(queue);
  } catch (error) {
    console.error("Failed to fetch print queue:", error);
    return NextResponse.json(
      { error: "خطا در دریافت صف چاپ" },
      { status: 500 }
    );
  }
}

// ✅ Only internal system should add to print queue (not exposed to clients)
export async function POST(request: NextRequest) {
  // ✅ This should only be called internally, not by clients
  // We'll allow admin auth for manual additions
  const auth = await verifyAuth(request);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const order = await request.json();

    if (!order.id || !order.restaurantId) {
      return NextResponse.json(
        { error: "شناسه سفارش و رستوران الزامی است" },
        { status: 400 }
      );
    }

    // ✅ Verify admin has access to this restaurant
    if (auth.restaurantId !== order.restaurantId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const added: boolean = await addToPrintQueue(order);

    if (!added) {
      return NextResponse.json(
        { message: "سفارش قبلاً در صف چاپ قرار دارد" },
        { status: 200 }
      );
    }

    console.log(
      `✅ Order ${order.id} added to print queue by ${auth.username}`
    );

    return NextResponse.json(
      { success: true, message: "سفارش به صف چاپ اضافه شد" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add to print queue:", error);
    return NextResponse.json(
      { error: "خطا در افزودن به صف چاپ" },
      { status: 500 }
    );
  }
}

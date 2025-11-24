// app/api/print-queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPrintQueue, addToPrintQueue } from "@/lib/db/kv";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    let queue: any[] = await getPrintQueue();

    // Filter by restaurant if provided
    if (restaurantId) {
      queue = queue.filter((item: any) => item.restaurantId === restaurantId);
    }

    return NextResponse.json(queue);
  } catch (error) {
    console.error("Failed to fetch print queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch print queue" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const order = await request.json();

    if (!order.id || !order.restaurantId) {
      return NextResponse.json(
        { error: "Order ID and Restaurant ID are required" },
        { status: 400 }
      );
    }

    const added: boolean = await addToPrintQueue(order);

    if (!added) {
      return NextResponse.json(
        { message: "Order already in print queue" },
        { status: 200 }
      );
    }

    console.log(`✅ Added order ${order.id} to print queue`);

    return NextResponse.json(
      { success: true, message: "Order added to print queue" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add to print queue:", error);
    return NextResponse.json(
      { error: "Failed to add to print queue" },
      { status: 500 }
    );
  }
}

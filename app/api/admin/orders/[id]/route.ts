// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { updateOrder, deleteOrder, getOrders } from "@/lib/db/kv";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { status } = await request.json();

    const orders: any[] = await getOrders();
    const order = orders.find((o: any) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify restaurant access
    if (order.restaurantId !== auth.restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedOrder: any = await updateOrder(id, { status });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await deleteOrder(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

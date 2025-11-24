// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  updateOrder,
  deleteOrder,
  getMenu,
  setMenu,
  getOrders,
} from "@/lib/db/kv";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const orders: any[] = await getOrders();
    const order = orders.find((o: any) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    // If cancelling an order, restore inventory
    if (oldStatus !== "cancelled" && status === "cancelled") {
      const restaurantMenu: any[] = await getMenu(order.restaurantId);

      for (const item of order.items) {
        const menuItemIndex = restaurantMenu.findIndex(
          (m: any) => m.id === item.id
        );
        if (menuItemIndex !== -1) {
          restaurantMenu[menuItemIndex].quantity += item.qty;

          // Re-enable if it was disabled due to no stock
          if (!restaurantMenu[menuItemIndex].available) {
            restaurantMenu[menuItemIndex].available = true;
          }
        }
      }

      await setMenu(order.restaurantId, restaurantMenu);
    }

    const updatedOrder: any = await updateOrder(id, { status });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Failed to update order:", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order: any = await deleteOrder(id);

    // Restore inventory when deleting order
    const restaurantMenu: any[] = await getMenu(order.restaurantId);

    for (const item of order.items) {
      const menuItemIndex = restaurantMenu.findIndex(
        (m: any) => m.id === item.id
      );
      if (menuItemIndex !== -1) {
        restaurantMenu[menuItemIndex].quantity += item.qty;
        restaurantMenu[menuItemIndex].available = true;
      }
    }

    await setMenu(order.restaurantId, restaurantMenu);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete order:", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

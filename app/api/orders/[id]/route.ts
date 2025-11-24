// app/api/orders/[id]/route.ts - Updated with inventory restoration
import { NextRequest, NextResponse } from "next/server";
import {
  getOrders,
  updateOrder,
  deleteOrder,
  getMenu,
  setMenu,
} from "@/lib/db/kv";

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params
    const { status } = await request.json();
    const orders = (await getOrders()) as any[];

    const existingOrder = orders.find((o: any) => o.id === id);

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await updateOrder(id, { status });

    // If cancelling an order, restore inventory
    if (existingOrder.status !== "cancelled" && status === "cancelled") {
      const restaurantMenu = await getMenu(existingOrder.restaurantId);

      for (const item of existingOrder.items) {
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

      await setMenu(existingOrder.restaurantId, restaurantMenu);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE - Delete order and restore inventory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params
    const order = await deleteOrder(id);

    // Restore inventory when deleting order
    const restaurantMenu = await getMenu(order.restaurantId);

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
    if (error.message === "Order not found") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

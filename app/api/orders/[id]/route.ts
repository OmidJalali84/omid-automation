// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  updateOrder,
  deleteOrder,
  getMenu,
  setMenu,
  getOrders,
} from "@/lib/db/kv";
import { verifyAuth } from "@/lib/middleware/auth";

// ✅ FIXED Issue #4: Require authentication
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Require authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    // ✅ FIXED Issue #14: Validate status
    const validStatuses = ["pending", "ready", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "وضعیت نامعتبر" }, { status: 400 });
    }

    const orders: any[] = await getOrders();
    const order = orders.find((o: any) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    // ✅ Verify admin has access to this restaurant
    if (order.restaurantId !== auth.restaurantId) {
      console.warn(
        `⚠️ Unauthorized order access attempt by ${auth.username} for ${order.id}`
      );
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
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

      // ✅ FIXED Issue #22: Security logging
      console.log(
        `✅ Order ${id} cancelled by ${auth.username}, inventory restored`
      );
    }

    const updatedOrder: any = await updateOrder(id, { status });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Failed to update order:", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "خطا در بروزرسانی سفارش" },
      { status: 500 }
    );
  }
}

// ✅ FIXED Issue #4: Require authentication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Require authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const orders: any[] = await getOrders();
    const order = orders.find((o: any) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    // ✅ Verify admin has access to this restaurant
    if (order.restaurantId !== auth.restaurantId) {
      console.warn(
        `⚠️ Unauthorized order deletion attempt by ${auth.username} for ${order.id}`
      );
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const deletedOrder: any = await deleteOrder(id);

    // Restore inventory when deleting order
    const restaurantMenu: any[] = await getMenu(deletedOrder.restaurantId);

    for (const item of deletedOrder.items) {
      const menuItemIndex = restaurantMenu.findIndex(
        (m: any) => m.id === item.id
      );
      if (menuItemIndex !== -1) {
        restaurantMenu[menuItemIndex].quantity += item.qty;
        restaurantMenu[menuItemIndex].available = true;
      }
    }

    await setMenu(deletedOrder.restaurantId, restaurantMenu);

    // ✅ FIXED Issue #22: Security logging
    console.log(
      `✅ Order ${id} deleted by ${auth.username}, inventory restored`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete order:", error);

    if (error.message === "Order not found") {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ error: "خطا در حذف سفارش" }, { status: 500 });
  }
}

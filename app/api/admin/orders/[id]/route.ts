// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyAuth } from "@/lib/middleware/auth";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

async function readOrders() {
  try {
    const data = await fs.readFile(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: any[]) {
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { status } = await request.json();
    const orders = await readOrders();

    const orderIndex = orders.findIndex((o: any) => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify restaurant access
    if (orders[orderIndex].restaurantId !== auth.restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    await writeOrders(orders);

    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const orders = await readOrders();
    const filteredOrders = orders.filter((o: any) => o.id !== id);

    if (orders.length === filteredOrders.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await writeOrders(filteredOrders);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

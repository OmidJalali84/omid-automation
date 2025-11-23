// app/api/orders/[id]/route.ts - Updated with inventory restoration
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");
const menuFilePath = path.join(process.cwd(), "data", "menu.json");

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

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

async function readMenu() {
  try {
    const data = await fs.readFile(menuFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeMenu(menu: any) {
  await fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2));
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orders = await readOrders();
    const menu = await readMenu();

    const orderIndex = orders.findIndex((o: any) => o.id === params.id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[orderIndex];
    const oldStatus = order.status;

    // If cancelling an order, restore inventory
    if (oldStatus !== "cancelled" && status === "cancelled") {
      const restaurantMenu = menu[order.restaurantId] || [];

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

      menu[order.restaurantId] = restaurantMenu;
      await writeMenu(menu);
    }

    // Update order status
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

// DELETE - Delete order and restore inventory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orders = await readOrders();
    const menu = await readMenu();

    const orderIndex = orders.findIndex((o: any) => o.id === params.id);

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Restore inventory when deleting order
    const restaurantMenu = menu[order.restaurantId] || [];

    for (const item of order.items) {
      const menuItemIndex = restaurantMenu.findIndex(
        (m: any) => m.id === item.id
      );
      if (menuItemIndex !== -1) {
        restaurantMenu[menuItemIndex].quantity += item.qty;
        restaurantMenu[menuItemIndex].available = true;
      }
    }

    menu[order.restaurantId] = restaurantMenu;
    await writeMenu(menu);

    // Remove order
    orders.splice(orderIndex, 1);
    await writeOrders(orders);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

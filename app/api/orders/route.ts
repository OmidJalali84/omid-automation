// app/api/orders/route.ts - Updated with inventory deduction
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
    await ensureDataDir();
    const data = await fs.readFile(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: any[]) {
  await ensureDataDir();
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}

async function readMenu() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(menuFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeMenu(menu: any) {
  await ensureDataDir();
  await fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2));
}

function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear();
  const number = Math.floor(Math.random() * 900000) + 100000;
  return `ORD-${year}-${number}`;
}

function generateKitchenNumber() {
  return Math.floor(Math.random() * 900) + 100;
}

// GET - Fetch all orders
export async function GET() {
  try {
    const orders = await readOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order with inventory deduction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurant,
      restaurantId,
      items,
      total,
      jettonWorth,
      payable,
      studentId,
      studentName,
    } = body;

    // Read current menu to check inventory
    const menu = await readMenu();
    const restaurantMenu = menu[restaurantId] || [];

    // Validate inventory availability
    for (const orderItem of items) {
      const menuItem = restaurantMenu.find((m: any) => m.id === orderItem.id);
      if (!menuItem) {
        return NextResponse.json(
          { error: `آیتم ${orderItem.name} یافت نشد` },
          { status: 400 }
        );
      }
      if (menuItem.quantity < orderItem.qty) {
        return NextResponse.json(
          {
            error: `موجودی کافی برای ${orderItem.name} وجود ندارد. موجود: ${menuItem.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Deduct inventory from menu
    for (const orderItem of items) {
      const itemIndex = restaurantMenu.findIndex(
        (m: any) => m.id === orderItem.id
      );
      if (itemIndex !== -1) {
        restaurantMenu[itemIndex].quantity -= orderItem.qty;

        // Auto disable if quantity reaches 0
        if (restaurantMenu[itemIndex].quantity <= 0) {
          restaurantMenu[itemIndex].available = false;
        }
      }
    }

    menu[restaurantId] = restaurantMenu;
    await writeMenu(menu);

    // Create order
    const orders = await readOrders();
    const newOrder = {
      id: generateOrderId(),
      kitchenNumber: generateKitchenNumber(),
      studentId: studentId || "4021101000",
      studentName: studentName || "کاربر سیستم",
      restaurant,
      restaurantId,
      mealType: "ناهار",
      date: new Date().toLocaleDateString("fa-IR"),
      time: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "pending",
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      total,
      paid: payable,
      jettonWorth,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    await writeOrders(orders);
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/print-queue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder),
        }
      );
    } catch (error) {
      console.error("Failed to add to print queue:", error);
      // Don't fail the order creation if print queue fails
    }

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

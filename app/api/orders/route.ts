// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read orders from file
async function readOrders() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write orders to file
async function writeOrders(orders: any[]) {
  await ensureDataDir();
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}

// Generate order ID
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear();
  const number = Math.floor(Math.random() * 900000) + 100000;
  return `ORD-${year}-${number}`;
}

// Generate kitchen number
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

// POST - Create new order
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

    const orders = await readOrders();

    const newOrder = {
      id: generateOrderId(),
      kitchenNumber: generateKitchenNumber(),
      studentId: studentId || "4021101000",
      studentName: studentName || "کاربر سیستم",
      restaurant,
      restaurantId,
      mealType: "ناهار", // Can be dynamic based on time
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

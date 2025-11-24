// app/api/orders/route.ts - Modified POST function
import { NextRequest, NextResponse } from "next/server";
import {
  getOrders,
  addOrder,
  getMenu,
  setMenu,
  addToPrintQueue,
} from "@/lib/db/kv";

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
    const orders = await getOrders();
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

    const restaurantMenu = await getMenu(restaurantId);

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

    await setMenu(restaurantId, restaurantMenu);

    // Create order
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

    await addOrder(newOrder);

    try {
      await addToPrintQueue(newOrder);
    } catch (error) {
      console.error("Failed to enqueue print job:", error);
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

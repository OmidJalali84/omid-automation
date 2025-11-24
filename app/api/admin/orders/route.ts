// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/db/kv";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurant = searchParams.get("restaurant");
    const since = searchParams.get("since");

    let orders: any[] = await getOrders();

    // Filter by restaurant
    if (restaurant) {
      orders = orders.filter((o: any) => o.restaurantId === restaurant);
    }

    // Filter by time (for polling)
    if (since) {
      const sinceDate = new Date(since);
      orders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate > sinceDate;
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

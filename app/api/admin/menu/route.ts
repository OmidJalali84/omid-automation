// app/api/admin/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { getMenu, addMenuItem } from "@/lib/db/kv";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (auth.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const menu: any[] = await getMenu(restaurantId!);
    return NextResponse.json(menu);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { restaurantId, name, price, category, image } = body;

    if (auth.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newItem = {
      id: Date.now(),
      name,
      price,
      category,
      image: image || "🍽️",
      available: true,
      quantity: 0,
      createdAt: new Date().toISOString(),
    };

    await addMenuItem(restaurantId, newItem);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

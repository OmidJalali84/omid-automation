// app/api/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMenu, setMenu, getRestaurants } from "@/lib/db/kv";

// GET - Fetch all menu items grouped by restaurant
export async function GET() {
  try {
    const restaurants = await getRestaurants();
    const entries = await Promise.all(
      Object.keys(restaurants).map(async (restaurantId) => {
        const items = await getMenu(restaurantId);
        return [restaurantId, items] as const;
      })
    );

    const menu = entries.reduce<Record<string, any[]>>((acc, [id, items]) => {
      acc[id] = items;
      return acc;
    }, {});

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// POST - Add new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, name, price, category, image, quantity } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    const restaurantMenu = await getMenu(restaurantId);

    const newItem = {
      id: Date.now(),
      name,
      price,
      category,
      image,
      quantity: quantity || 0,
      available: true,
      createdAt: new Date().toISOString(),
    };

    restaurantMenu.push(newItem);
    await setMenu(restaurantId, restaurantMenu);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// app/api/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMenu, setMenu } from "@/lib/db/kv";

export async function GET() {
  try {
    // Return all menus for all restaurants
    const restaurants = ["amiralmomenin", "kaktus", "zitoun", "toranj"];
    const allMenus: Record<string, any[]> = {};

    for (const restaurantId of restaurants) {
      const menu: any[] = await getMenu(restaurantId);
      allMenus[restaurantId] = menu;
    }

    return NextResponse.json(allMenus);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, name, price, category, image, quantity } = body;

    const menu: any[] = await getMenu(restaurantId);

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

    menu.push(newItem);
    await setMenu(restaurantId, menu);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

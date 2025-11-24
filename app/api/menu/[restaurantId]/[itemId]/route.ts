// app/api/menu/[restaurantId]/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMenu, setMenu } from "@/lib/db/kv";

// PATCH - Update menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  try {
    const { restaurantId, itemId } = await params; // ✅ AWAIT params
    const body = await request.json();
    const menu = await getMenu(restaurantId);

    const itemIndex = menu.findIndex(
      (item: any) => String(item.id) === itemId || item.id === Number(itemId)
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    menu[itemIndex] = {
      ...menu[itemIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await setMenu(restaurantId, menu);

    return NextResponse.json({
      success: true,
      item: menu[itemIndex],
    });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  try {
    const { restaurantId, itemId } = await params; // ✅ AWAIT params
    const menu = await getMenu(restaurantId);

    const filteredMenu = menu.filter(
      (item: any) => String(item.id) !== itemId && item.id !== Number(itemId)
    );

    if (filteredMenu.length === menu.length) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    await setMenu(restaurantId, filteredMenu);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

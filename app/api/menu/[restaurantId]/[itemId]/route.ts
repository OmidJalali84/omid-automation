// app/api/menu/[restaurantId]/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMenu, setMenu } from "@/lib/db/kv";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  try {
    const { restaurantId, itemId } = await params;
    const body = await request.json();
    const menu: any[] = await getMenu(restaurantId);

    if (!menu || menu.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const itemIndex = menu.findIndex(
      (item: any) => item.id === parseInt(itemId)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  try {
    const { restaurantId, itemId } = await params;
    const menu: any[] = await getMenu(restaurantId);

    if (!menu || menu.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const initialLength = menu.length;
    const filteredMenu = menu.filter(
      (item: any) => item.id !== parseInt(itemId)
    );

    if (filteredMenu.length === initialLength) {
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

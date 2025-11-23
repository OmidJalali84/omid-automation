// app/api/admin/menu/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyAuth } from "@/lib/middleware/auth";

const menuFilePath = path.join(process.cwd(), "data", "menu.json");

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const itemId = parseInt(id);

    const allMenus = await readMenu();
    const restaurantMenu = allMenus[auth.restaurantId] || [];

    const itemIndex = restaurantMenu.findIndex(
      (item: any) => item.id === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update item
    restaurantMenu[itemIndex] = {
      ...restaurantMenu[itemIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    allMenus[auth.restaurantId] = restaurantMenu;
    await writeMenu(allMenus);

    return NextResponse.json({
      success: true,
      item: restaurantMenu[itemIndex],
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
  context: { params: Promise<{ id: string }> }
) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const itemId = parseInt(id);

    const allMenus = await readMenu();
    const restaurantMenu = allMenus[auth.restaurantId] || [];

    const filteredMenu = restaurantMenu.filter(
      (item: any) => item.id !== itemId
    );

    if (restaurantMenu.length === filteredMenu.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    allMenus[auth.restaurantId] = filteredMenu;
    await writeMenu(allMenus);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

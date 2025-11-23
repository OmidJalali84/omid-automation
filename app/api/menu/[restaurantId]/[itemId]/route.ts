// app/api/menu/[restaurantId]/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const menuFilePath = path.join(process.cwd(), "data", "menu.json");

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
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

// PATCH - Update menu item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  try {
    const { restaurantId, itemId } = await params; // ✅ AWAIT params
    const body = await request.json();
    const menu = await readMenu();

    if (!menu[restaurantId]) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const itemIndex = menu[restaurantId].findIndex(
      (item: any) => item.id === parseInt(itemId)
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    menu[restaurantId][itemIndex] = {
      ...menu[restaurantId][itemIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await writeMenu(menu);

    return NextResponse.json({
      success: true,
      item: menu[restaurantId][itemIndex],
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
    const menu = await readMenu();

    if (!menu[restaurantId]) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const initialLength = menu[restaurantId].length;
    menu[restaurantId] = menu[restaurantId].filter(
      (item: any) => item.id !== parseInt(itemId)
    );

    if (menu[restaurantId].length === initialLength) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    await writeMenu(menu);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

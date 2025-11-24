// app/api/menu/[restaurantId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const menuFilePath = path.join(process.cwd(), "data", "menu.json");

async function readMenu() {
  try {
    const data = await fs.readFile(menuFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading menu file:", error);
    return {};
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params; // ✅ AWAIT params
    const allMenus = await readMenu();
    const restaurantMenu = allMenus[restaurantId] || [];

    // Only return available items for public endpoint
    const availableItems = restaurantMenu.filter((item: any) => item.available);

    return NextResponse.json(availableItems);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

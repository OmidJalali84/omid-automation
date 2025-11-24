// app/api/menu/route.ts
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

// GET - Fetch all menu items
export async function GET() {
  try {
    const menu = await readMenu();
    return NextResponse.json(menu);
  } catch (error) {
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

    const menu = await readMenu();
    if (!menu[restaurantId]) {
      menu[restaurantId] = [];
    }

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

    menu[restaurantId].push(newItem);
    await writeMenu(menu);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

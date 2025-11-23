// app/api/admin/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyAuth } from "@/lib/middleware/auth";

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

export async function GET(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    // Verify restaurant access
    if (auth.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allMenus = await readMenu();
    const restaurantMenu = allMenus[restaurantId] || [];

    return NextResponse.json(restaurantMenu);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { restaurantId, name, price, category, image } = body;

    // Verify restaurant access
    if (auth.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allMenus = await readMenu();

    if (!allMenus[restaurantId]) {
      allMenus[restaurantId] = [];
    }

    const newItem = {
      id: Date.now(),
      name,
      price,
      category,
      image: image || "🍽️",
      available: true,
      createdAt: new Date().toISOString(),
    };

    allMenus[restaurantId].push(newItem);
    await writeMenu(allMenus);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

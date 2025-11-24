// app/api/menu/[restaurantId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMenu } from "@/lib/db/kv";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;
    const restaurantMenu: any[] = await getMenu(restaurantId);

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

// app/api/admin/menu/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/middleware/auth";
import { updateMenuItem, deleteMenuItem } from "@/lib/db/kv";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const itemId = parseInt(id);

    const updatedItem: any = await updateMenuItem(
      auth.restaurantId,
      itemId,
      body
    );

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error: any) {
    console.error("Failed to update menu item:", error);

    if (error.message === "Item not found") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const itemId = parseInt(id);

    await deleteMenuItem(auth.restaurantId, itemId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete menu item:", error);

    if (error.message === "Item not found") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

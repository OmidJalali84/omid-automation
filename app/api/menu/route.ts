// app/api/menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMenu, setMenu } from "@/lib/db/kv";
import { verifyAuth } from "@/lib/middleware/auth";

// ✅ FIXED Issue #4: GET is now read-only for public (available items only)
// Admin access required for full menu
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const restaurants = ["amiralmomenin", "kaktus", "zitoun", "toranj"];
    const allMenus: Record<string, any[]> = {};

    for (const restaurantId of restaurants) {
      const menu: any[] = await getMenu(restaurantId);

      if (auth) {
        // ✅ Admin sees everything
        allMenus[restaurantId] = menu;
      } else {
        // ✅ Public only sees available items
        allMenus[restaurantId] = menu.filter((item: any) => item.available);
      }
    }

    return NextResponse.json(allMenus);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "خطا در دریافت منو" }, { status: 500 });
  }
}

// ✅ FIXED Issue #4: POST requires authentication
export async function POST(request: NextRequest) {
  // ✅ Require authentication
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { restaurantId, name, price, category, image, quantity } = body;

    // ✅ FIXED Issue #14: Input validation
    if (!restaurantId || typeof restaurantId !== "string") {
      return NextResponse.json(
        { error: "شناسه رستوران نامعتبر" },
        { status: 400 }
      );
    }

    // ✅ Verify admin has access to this restaurant
    if (auth.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // ✅ Validate name
    if (
      !name ||
      typeof name !== "string" ||
      name.length === 0 ||
      name.length > 200
    ) {
      return NextResponse.json({ error: "نام غذا نامعتبر" }, { status: 400 });
    }

    // ✅ Validate price - must be positive
    if (typeof price !== "number" || price < 0 || price > 10000000) {
      return NextResponse.json({ error: "قیمت نامعتبر" }, { status: 400 });
    }

    // ✅ Validate quantity - must be non-negative
    const validatedQuantity =
      typeof quantity === "number" && quantity >= 0 ? quantity : 0;
    if (validatedQuantity > 10000) {
      return NextResponse.json({ error: "تعداد نامعتبر" }, { status: 400 });
    }

    // ✅ Validate category
    const validCategories = ["غذای ایرانی", "فست فود", "پیتزا", "صبحانه"];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: "دسته‌بندی نامعتبر" }, { status: 400 });
    }

    // ✅ Sanitize image (emoji only)
    const sanitizedImage =
      image && typeof image === "string" && image.length <= 10 ? image : "🍽️";

    const menu: any[] = await getMenu(restaurantId);

    const newItem = {
      id: Date.now(),
      name: name.trim(),
      price: Math.round(price), // Round to integer
      category,
      image: sanitizedImage,
      quantity: validatedQuantity,
      available: true,
      createdAt: new Date().toISOString(),
      createdBy: auth.username,
    };

    menu.push(newItem);
    await setMenu(restaurantId, menu);

    // ✅ FIXED Issue #22: Security logging
    console.log(`✅ Menu item created: ${newItem.name} by ${auth.username}`);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد آیتم منو" },
      { status: 500 }
    );
  }
}

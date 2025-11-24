// app/api/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const restaurantsFilePath = path.join(
  process.cwd(),
  "data",
  "restaurants.json"
);

async function readRestaurants() {
  try {
    const data = await fs.readFile(restaurantsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading restaurants file:", error);
    return {};
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ AWAIT params
    const restaurants = await readRestaurants();
    const restaurant = restaurants[id];

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Failed to fetch restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

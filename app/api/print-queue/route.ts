import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const printQueueFilePath = path.join(process.cwd(), "data", "print-queue.json");

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readPrintQueue() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(printQueueFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePrintQueue(queue: any[]) {
  await ensureDataDir();
  await fs.writeFile(printQueueFilePath, JSON.stringify(queue, null, 2));
}

// GET - Fetch all pending print jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    let queue = await readPrintQueue();

    // Filter by restaurant if provided
    if (restaurantId) {
      queue = queue.filter((item: any) => item.restaurantId === restaurantId);
    }

    return NextResponse.json(queue);
  } catch (error) {
    console.error("Failed to fetch print queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch print queue" },
      { status: 500 }
    );
  }
}

// POST - Add order to print queue
export async function POST(request: NextRequest) {
  try {
    const order = await request.json();

    if (!order.id || !order.restaurantId) {
      return NextResponse.json(
        { error: "Order ID and Restaurant ID are required" },
        { status: 400 }
      );
    }

    const queue = await readPrintQueue();

    // Check if already in queue
    const exists = queue.some((item: any) => item.id === order.id);
    if (exists) {
      return NextResponse.json(
        { message: "Order already in print queue" },
        { status: 200 }
      );
    }

    // Add to queue with timestamp
    const printJob = {
      ...order,
      addedToQueueAt: new Date().toISOString(),
    };

    queue.push(printJob);
    await writePrintQueue(queue);

    console.log(`✅ Added order ${order.id} to print queue`);

    return NextResponse.json(
      { success: true, message: "Order added to print queue" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add to print queue:", error);
    return NextResponse.json(
      { error: "Failed to add to print queue" },
      { status: 500 }
    );
  }
}

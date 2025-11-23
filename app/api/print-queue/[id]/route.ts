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

// DELETE - Remove order from print queue after printing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const queue = await readPrintQueue();

    const initialLength = queue.length;
    const filteredQueue = queue.filter((item: any) => item.id !== id);

    if (filteredQueue.length === initialLength) {
      return NextResponse.json(
        { error: "Order not found in print queue" },
        { status: 404 }
      );
    }

    await writePrintQueue(filteredQueue);

    console.log(`🗑️ Removed order ${id} from print queue`);

    return NextResponse.json({
      success: true,
      message: "Order removed from print queue",
    });
  } catch (error) {
    console.error("Failed to remove from print queue:", error);
    return NextResponse.json(
      { error: "Failed to remove from print queue" },
      { status: 500 }
    );
  }
}

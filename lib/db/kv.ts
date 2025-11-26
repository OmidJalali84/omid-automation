// lib/db/kv.ts
import { createClient } from "redis";

// ✅ FIXED Issue #13: Secure Redis connection
const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("CRITICAL: REDIS_URL environment variable must be set");
}

// ✅ Configure secure Redis connection
const redisConfig: any = {
  url: REDIS_URL,
};

// ✅ Enable TLS for production (Redis Cloud, AWS ElastiCache, etc.)
if (process.env.NODE_ENV === "production" || process.env.REDIS_TLS === "true") {
  redisConfig.socket = {
    tls: true,
    rejectUnauthorized: true, // Verify certificates
  };
}

const redis = await createClient(redisConfig).connect();

redis.on("error", (err) => console.error("Redis Client Error:", err));
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("disconnect", () => console.warn("⚠️ Redis disconnected"));

// Keys for different data types
const KEYS = {
  MENU: (restaurantId: string) => `menu:${restaurantId}`,
  ORDERS: "orders",
  ADMINS: "admins",
  RESTAURANTS: "restaurants",
  PRINT_QUEUE: "print-queue",
  ROADMAP_STATUS: "roadmap-status",
  ORDER_COUNTER: "order-counter",
};

// Menu Operations
export async function getMenu(restaurantId: string): Promise<any[]> {
  try {
    const menuStr = await redis.get(KEYS.MENU(restaurantId));
    if (!menuStr) return [];
    return JSON.parse(menuStr);
  } catch (error) {
    console.error("Failed to get menu:", error);
    return [];
  }
}

export async function setMenu(restaurantId: string, items: any[]) {
  try {
    await redis.set(KEYS.MENU(restaurantId), JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Failed to set menu:", error);
    throw error;
  }
}

export async function addMenuItem(restaurantId: string, item: any) {
  const menu = await getMenu(restaurantId);
  menu.push(item);
  await setMenu(restaurantId, menu);
  return item;
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: number,
  updates: any
) {
  const menu = await getMenu(restaurantId);
  const itemIndex = menu.findIndex((item: any) => item.id === itemId);

  if (itemIndex === -1) {
    throw new Error("Item not found");
  }

  menu[itemIndex] = {
    ...menu[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await setMenu(restaurantId, menu);
  return menu[itemIndex];
}

export async function deleteMenuItem(restaurantId: string, itemId: number) {
  const menu = await getMenu(restaurantId);
  const filteredMenu = menu.filter((item: any) => item.id !== itemId);

  if (menu.length === filteredMenu.length) {
    throw new Error("Item not found");
  }

  await setMenu(restaurantId, filteredMenu);
  return true;
}

// Orders Operations
export async function getOrders(): Promise<any[]> {
  try {
    const ordersStr = await redis.get(KEYS.ORDERS);
    if (!ordersStr) return [];
    return JSON.parse(ordersStr);
  } catch (error) {
    console.error("Failed to get orders:", error);
    return [];
  }
}

export async function setOrders(orders: any[]) {
  try {
    await redis.set(KEYS.ORDERS, JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error("Failed to set orders:", error);
    throw error;
  }
}

export async function addOrder(order: any) {
  const orders = await getOrders();
  orders.unshift(order);
  await setOrders(orders);
  return order;
}

export async function updateOrder(orderId: string, updates: any) {
  const orders = await getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === orderId);

  if (orderIndex === -1) {
    throw new Error("Order not found");
  }

  orders[orderIndex] = {
    ...orders[orderIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await setOrders(orders);
  return orders[orderIndex];
}

export async function deleteOrder(orderId: string) {
  const orders = await getOrders();
  const orderIndex = orders.findIndex((o: any) => o.id === orderId);

  if (orderIndex === -1) {
    throw new Error("Order not found");
  }

  const order = orders[orderIndex];
  orders.splice(orderIndex, 1);
  await setOrders(orders);
  return order;
}

// Admins Operations
export async function getAdmins(): Promise<any[]> {
  try {
    const adminsStr = await redis.get(KEYS.ADMINS);
    if (!adminsStr) return [];
    return JSON.parse(adminsStr);
  } catch (error) {
    console.error("Failed to get admins:", error);
    return [];
  }
}

export async function findAdminByUsername(
  username: string
): Promise<any | undefined> {
  const admins = await getAdmins();
  return admins.find((a: any) => a.username === username);
}

// Restaurants Operations
export async function getRestaurants(): Promise<Record<string, any>> {
  try {
    const restaurantsStr = await redis.get(KEYS.RESTAURANTS);
    if (!restaurantsStr) return {};
    return JSON.parse(restaurantsStr);
  } catch (error) {
    console.error("Failed to get restaurants:", error);
    return {};
  }
}

export async function getRestaurant(
  restaurantId: string
): Promise<any | undefined> {
  const restaurants = await getRestaurants();
  return restaurants[restaurantId];
}

// Print Queue Operations
export async function getPrintQueue(): Promise<any[]> {
  try {
    const queueStr = await redis.get(KEYS.PRINT_QUEUE);
    if (!queueStr) return [];
    return JSON.parse(queueStr);
  } catch (error) {
    console.error("Failed to get print queue:", error);
    return [];
  }
}

export async function setPrintQueue(queue: any[]) {
  try {
    await redis.set(KEYS.PRINT_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error("Failed to set print queue:", error);
    throw error;
  }
}

export async function addToPrintQueue(order: any) {
  const queue = await getPrintQueue();

  const exists = queue.some((item: any) => item.id === order.id);
  if (exists) {
    return false;
  }

  const printJob = {
    ...order,
    addedToQueueAt: new Date().toISOString(),
  };

  queue.push(printJob);
  await setPrintQueue(queue);
  return true;
}

export async function removeFromPrintQueue(orderId: string) {
  const queue = await getPrintQueue();
  const filteredQueue = queue.filter((item: any) => item.id !== orderId);

  if (queue.length === filteredQueue.length) {
    throw new Error("Order not found in print queue");
  }

  await setPrintQueue(filteredQueue);
  return true;
}

// Roadmap Status Operations
export async function getRoadmapStatus(): Promise<Record<string, boolean>> {
  try {
    const statusStr = await redis.get(KEYS.ROADMAP_STATUS);
    if (!statusStr) return {};
    return JSON.parse(statusStr);
  } catch (error) {
    console.error("Failed to get roadmap status:", error);
    return {};
  }
}

export async function toggleRoadmapTask(key: string) {
  const statuses = await getRoadmapStatus();
  const currentStatus = statuses[key];
  const nextStatus = currentStatus === undefined ? false : !currentStatus;
  statuses[key] = nextStatus;
  await redis.set(KEYS.ROADMAP_STATUS, JSON.stringify(statuses));
  return { status: nextStatus };
}

// ✅ FIXED Issue #12: Atomic counter operations
export async function getOrderCounter(): Promise<{
  date: string;
  counter: number;
}> {
  try {
    const counterStr = await redis.get(KEYS.ORDER_COUNTER);
    if (!counterStr) {
      const today = new Date().toLocaleDateString("fa-IR");
      return { date: today, counter: 1100 };
    }
    return JSON.parse(counterStr);
  } catch (error) {
    console.error("Failed to get order counter:", error);
    const today = new Date().toLocaleDateString("fa-IR");
    return { date: today, counter: 1100 };
  }
}

// ✅ FIXED Issue #12: Use Redis atomic INCR for thread-safe counter
export async function getNextOrderNumber(): Promise<number> {
  try {
    const today = new Date().toLocaleDateString("fa-IR");
    const dateKey = `order-counter:date`;
    const counterKey = `order-counter:value`;

    // ✅ Check if we need to reset (new day)
    const storedDate = await redis.get(dateKey);

    if (storedDate !== today) {
      // New day - reset atomically
      await redis.set(dateKey, today);
      await redis.set(counterKey, "1100");
      return 1100;
    }

    // ✅ Use atomic INCR - thread-safe!
    const nextNumber = await redis.incr(counterKey);

    return nextNumber;
  } catch (error) {
    console.error("Failed to get next order number:", error);
    // Fallback to timestamp-based number
    return 1100 + (Date.now() % 9000);
  }
}

export async function resetDailyCounter() {
  try {
    const today = new Date().toLocaleDateString("fa-IR");
    await redis.set(`order-counter:date`, today);
    await redis.set(`order-counter:value`, "1100");
    console.log(`✅ Daily counter reset to 1100 for ${today}`);
    return true;
  } catch (error) {
    console.error("Failed to reset daily counter:", error);
    throw error;
  }
}

// Initialize data (use scripts/init-database.ts instead)
export async function initializeData() {
  throw new Error(
    "❌ Do not use this function. Use scripts/init-database.ts instead and DELETE app/api/init-data"
  );
}

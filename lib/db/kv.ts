import { kv } from "@vercel/kv";
import { promises as fs } from "fs";
import path from "path";

// Keys for different data types
const KEYS = {
  MENU: (restaurantId: string) => `menu:${restaurantId}`,
  ORDERS: "orders",
  ADMINS: "admins",
  RESTAURANTS: "restaurants",
  PRINT_QUEUE: "print-queue",
  ROADMAP_STATUS: "roadmap-status",
};

const DEFAULT_RESTAURANTS: Record<string, any> = {
  amiralmomenin: {
    id: "amiralmomenin",
    name: "امیرالمومنین",
    description: "سلف سرویس اصلی دانشگاه با ظرفیت بالا و سرویس‌دهی سریع",
  },
  kaktus: {
    id: "kaktus",
    name: "کاکتوس",
    description: "فست‌فود دانشجویی با سرو سریع و تنوع بالا",
  },
  zitoun: {
    id: "zitoun",
    name: "زیتون",
    description: "غذاهای ایرانی خانگی با کیفیت ثابت",
  },
  toranj: {
    id: "toranj",
    name: "ترنج",
    description: "سلامت‌محور با سالادها و نوشیدنی‌های تازه",
  },
};

const LOCAL_KV_DIR = path.join(process.cwd(), "data");
const LOCAL_KV_FILE = path.join(LOCAL_KV_DIR, "kv-store.json");
const hasRemoteKV =
  Boolean(process.env.KV_REST_API_URL) &&
  Boolean(process.env.KV_REST_API_TOKEN);
const runningOnVercel = Boolean(process.env.VERCEL);
const canUseLocalKV = !hasRemoteKV && !runningOnVercel;

async function ensureLocalStore() {
  await fs.mkdir(LOCAL_KV_DIR, { recursive: true });
}

async function readLocalStore(): Promise<Record<string, any>> {
  if (!canUseLocalKV) {
    throw new Error(
      "Local KV fallback is disabled in this environment. Please configure Vercel KV."
    );
  }
  try {
    await ensureLocalStore();
    const content = await fs.readFile(LOCAL_KV_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeLocalStore(data: Record<string, any>) {
  if (!canUseLocalKV) {
    throw new Error(
      "Local KV fallback is disabled in this environment. Please configure Vercel KV."
    );
  }
  await ensureLocalStore();
  await fs.writeFile(LOCAL_KV_FILE, JSON.stringify(data, null, 2));
}

async function storageGet<T>(key: string): Promise<T | null> {
  if (hasRemoteKV) {
    return (await kv.get<T>(key)) ?? null;
  }

  if (!canUseLocalKV) {
    throw new Error(
      "Vercel KV environment variables are missing and local fallback is disabled in this runtime."
    );
  }

  const store = await readLocalStore();
  return (store[key] ?? null) as T | null;
}

async function storageSet<T>(key: string, value: T): Promise<void> {
  if (hasRemoteKV) {
    await kv.set(key, value);
    return;
  }

  if (!canUseLocalKV) {
    throw new Error(
      "Vercel KV environment variables are missing and local fallback is disabled in this runtime."
    );
  }

  const store = await readLocalStore();
  store[key] = value;
  await writeLocalStore(store);
}

// Menu Operations
export async function getMenu(restaurantId: string): Promise<any[]> {
  try {
    const menu = await storageGet<any[]>(KEYS.MENU(restaurantId));
    return menu || [];
  } catch (error) {
    console.error("Failed to get menu:", error);
    return [];
  }
}

export async function setMenu(
  restaurantId: string,
  items: any[]
): Promise<boolean> {
  try {
    await storageSet(KEYS.MENU(restaurantId), items);
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
    const orders = await storageGet<any[]>(KEYS.ORDERS);
    return orders || [];
  } catch (error) {
    console.error("Failed to get orders:", error);
    return [];
  }
}

export async function setOrders(orders: any[]): Promise<boolean> {
  try {
    await storageSet(KEYS.ORDERS, orders);
    return true;
  } catch (error) {
    console.error("Failed to set orders:", error);
    throw error;
  }
}

export async function addOrder(order: any): Promise<any> {
  const orders = await getOrders();
  orders.unshift(order);
  await setOrders(orders);
  return order;
}

export async function updateOrder(orderId: string, updates: any): Promise<any> {
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

export async function deleteOrder(orderId: string): Promise<any> {
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
    const admins = await storageGet<any[]>(KEYS.ADMINS);
    return admins || [];
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
    let restaurants = await storageGet<Record<string, any>>(KEYS.RESTAURANTS);
    if (!restaurants || Object.keys(restaurants).length === 0) {
      restaurants = { ...DEFAULT_RESTAURANTS };
      await storageSet(KEYS.RESTAURANTS, restaurants);
    }
    return restaurants;
  } catch (error) {
    console.error("Failed to get restaurants:", error);
    return { ...DEFAULT_RESTAURANTS };
  }
}

export async function getRestaurant(restaurantId: string): Promise<any> {
  const restaurants = await getRestaurants();
  return restaurants[restaurantId];
}

// Print Queue Operations
export async function getPrintQueue(): Promise<any[]> {
  try {
    const queue = await storageGet<any[]>(KEYS.PRINT_QUEUE);
    return queue || [];
  } catch (error) {
    console.error("Failed to get print queue:", error);
    return [];
  }
}

export async function setPrintQueue(queue: any[]): Promise<boolean> {
  try {
    await storageSet(KEYS.PRINT_QUEUE, queue);
    return true;
  } catch (error) {
    console.error("Failed to set print queue:", error);
    throw error;
  }
}

export async function addToPrintQueue(order: any): Promise<boolean> {
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

export async function removeFromPrintQueue(orderId: string): Promise<boolean> {
  const queue = await getPrintQueue();
  const filteredQueue = queue.filter((item: any) => item.id !== orderId);

  if (queue.length === filteredQueue.length) {
    throw new Error("Order not found in print queue");
  }

  await setPrintQueue(filteredQueue);
  return true;
}

// Roadmap Status Operations
export async function getRoadmapStatus(): Promise<Record<string, any>> {
  try {
    const status = await storageGet<Record<string, any>>(KEYS.ROADMAP_STATUS);
    return status || {};
  } catch (error) {
    console.error("Failed to get roadmap status:", error);
    return {};
  }
}

export async function toggleRoadmapTask(
  key: string
): Promise<{ status: boolean }> {
  const statuses = await getRoadmapStatus();
  const currentStatus = statuses[key];
  const nextStatus = currentStatus === undefined ? false : !currentStatus;
  statuses[key] = nextStatus;
  await storageSet(KEYS.ROADMAP_STATUS, statuses);
  return { status: nextStatus };
}

// Initialize data (run once to migrate from JSON)
export async function initializeData() {
  try {
    // Initialize restaurants
    const restaurants = {
      amiralmomenin: {
        id: "amiralmomenin",
        name: "امیرالمومنین",
        description: "سلف سرویس اصلی دانشگاه با ظرفیت بالا و سرویس‌دهی سریع",
      },
      kaktus: {
        id: "kaktus",
        name: "کاکتوس",
        description: "فست‌فود دانشجویی با سرو سریع و تنوع بالا",
      },
      zitoun: {
        id: "zitoun",
        name: "زیتون",
        description: "غذاهای ایرانی خانگی با کیفیت ثابت",
      },
      toranj: {
        id: "toranj",
        name: "ترنج",
        description: "سلامت‌محور با سالادها و نوشیدنی‌های تازه",
      },
    };

    await storageSet(KEYS.RESTAURANTS, restaurants);

    // Initialize admins
    const admins = [
      {
        username: "amiralmomenin_admin",
        passwordHash:
          "$2a$10$30r4FdfRaDAlTHBdLgLquO.2d2/yD6YlPCeis23dElNHofxmllKOm",
        restaurantId: "amiralmomenin",
        restaurantName: "امیرالمومنین",
        createdAt: "2025-11-13T00:00:00.000Z",
      },
    ];

    await storageSet(KEYS.ADMINS, admins);

    // Initialize empty orders and print queue
    await storageSet(KEYS.ORDERS, []);
    await storageSet(KEYS.PRINT_QUEUE, []);
    await storageSet(KEYS.ROADMAP_STATUS, {});

    // Initialize empty menus for each restaurant
    await storageSet(KEYS.MENU("amiralmomenin"), []);
    await storageSet(KEYS.MENU("kaktus"), []);
    await storageSet(KEYS.MENU("zitoun"), []);
    await storageSet(KEYS.MENU("toranj"), []);

    console.log("✅ Data initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize data:", error);
    throw error;
  }
}

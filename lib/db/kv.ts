import { createClient } from "redis";

const redis = await createClient({ url: process.env.REDIS_URL }).connect();

// Keys for different data types
const KEYS = {
  MENU: (restaurantId: string) => `menu:${restaurantId}`,
  ORDERS: "orders",
  ADMINS: "admins",
  RESTAURANTS: "restaurants",
  PRINT_QUEUE: "print-queue",
  ROADMAP_STATUS: "roadmap-status",
  ORDER_COUNTER: "order-counter", // Stores { date: string, counter: number }
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

    await redis.set(KEYS.RESTAURANTS, JSON.stringify(restaurants));

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

    await redis.set(KEYS.ADMINS, JSON.stringify(admins));

    // Initialize empty orders and print queue
    await redis.set(KEYS.ORDERS, JSON.stringify([]));
    await redis.set(KEYS.PRINT_QUEUE, JSON.stringify([]));
    await redis.set(KEYS.ROADMAP_STATUS, JSON.stringify({}));

    // Initialize empty menus for each restaurant
    await redis.set(KEYS.MENU("amiralmomenin"), JSON.stringify([]));
    await redis.set(KEYS.MENU("kaktus"), JSON.stringify([]));
    await redis.set(KEYS.MENU("zitoun"), JSON.stringify([]));
    await redis.set(KEYS.MENU("toranj"), JSON.stringify([]));

    console.log("✅ Data initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize data:", error);
    throw error;
  }
}

// Order Counter Operations
export async function getOrderCounter(): Promise<{ date: string; counter: number }> {
  try {
    const counterStr = await redis.get(KEYS.ORDER_COUNTER);
    if (!counterStr) {
      // Initialize with today's date and starting counter
      const today = new Date().toLocaleDateString('fa-IR');
      return { date: today, counter: 1100 };
    }
    return JSON.parse(counterStr);
  } catch (error) {
    console.error("Failed to get order counter:", error);
    const today = new Date().toLocaleDateString('fa-IR');
    return { date: today, counter: 1100 };
  }
}

export async function getNextOrderNumber(): Promise<number> {
  try {
    const today = new Date().toLocaleDateString('fa-IR');
    const counterData = await getOrderCounter();
    
    // Check if we need to reset the counter (new day)
    if (counterData.date !== today) {
      // New day - reset to 1100
      const newCounter = { date: today, counter: 1100 };
      await redis.set(KEYS.ORDER_COUNTER, JSON.stringify(newCounter));
      return 1100;
    }
    
    // Same day - increment counter
    const nextNumber = counterData.counter + 1;
    const updatedCounter = { date: today, counter: nextNumber };
    await redis.set(KEYS.ORDER_COUNTER, JSON.stringify(updatedCounter));
    
    return nextNumber;
  } catch (error) {
    console.error("Failed to get next order number:", error);
    // Fallback to random number in case of error
    return Math.floor(Math.random() * 900) + 1100;
  }
}

export async function resetDailyCounter() {
  try {
    const today = new Date().toLocaleDateString('fa-IR');
    const newCounter = { date: today, counter: 1100 };
    await redis.set(KEYS.ORDER_COUNTER, JSON.stringify(newCounter));
    console.log(`✅ Daily counter reset to 1100 for ${today}`);
    return true;
  } catch (error) {
    console.error("Failed to reset daily counter:", error);
    throw error;
  }
}
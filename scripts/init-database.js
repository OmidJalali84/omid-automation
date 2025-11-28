// scripts/init-database.ts
// ⚠️ RUN THIS ONCE, THEN DELETE THIS FILE

import { createClient } from "redis";
import * as dotenv from "dotenv";

dotenv.config();

const REDIS_URL = "redis://default:IkiI6JVyMBbURGMvAjtKYzkZStLttjql@redis-14643.c57.us-east-1-4.ec2.cloud.redislabs.com:14643"

if (!REDIS_URL) {
  console.error("❌ REDIS_URL environment variable is not set");
  process.exit(1);
}

async function initializeDatabase() {
  console.log("🔄 Connecting to Redis...");
  const redis = await createClient({ url: REDIS_URL }).connect();

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

    await redis.set("restaurants", JSON.stringify(restaurants));
    console.log("✅ Restaurants initialized");

    // Initialize admins
    const admins = [
      {
        username: "amiralmomenin_admin",
        // ⚠️ CHANGE THIS PASSWORD HASH - see README for instructions
        passwordHash:
          "$2a$10$30r4FdfRaDAlTHBdLgLquO.2d2/yD6YlPCeis23dElNHofxmllKOm",
        restaurantId: "amiralmomenin",
        restaurantName: "امیرالمومنین",
        createdAt: new Date().toISOString(),
      },
    ];

    await redis.set("admins", JSON.stringify(admins));
    console.log("✅ Admins initialized");

    // Initialize empty collections
    await redis.set("orders", JSON.stringify([]));
    await redis.set("print-queue", JSON.stringify([]));
    await redis.set("roadmap-status", JSON.stringify({}));

    // Initialize empty menus
    await redis.set("menu:amiralmomenin", JSON.stringify([]));
    await redis.set("menu:kaktus", JSON.stringify([]));
    await redis.set("menu:zitoun", JSON.stringify([]));
    await redis.set("menu:toranj", JSON.stringify([]));

    // Initialize order counter
    const today = new Date().toLocaleDateString("fa-IR");
    await redis.set(
      "order-counter",
      JSON.stringify({ date: today, counter: 1100 })
    );

    console.log("✅ Empty collections initialized");
    console.log("");
    console.log("🎉 Database initialization complete!");
    console.log("");
    console.log("⚠️  IMPORTANT NEXT STEPS:");
    console.log("1. DELETE this file (scripts/init-database.ts)");
    console.log("2. DELETE app/api/init-data/route.ts if it exists");
    console.log("3. Change the admin password hash in Redis");
    console.log("4. Set a strong JWT_SECRET in .env");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
  } finally {
    await redis.quit();
  }
}

initializeDatabase();

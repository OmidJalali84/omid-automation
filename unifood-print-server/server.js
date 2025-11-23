const puppeteer = require("puppeteer");
const escpos = require("escpos");
escpos.Network = require("escpos-network");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

const printerIP = process.env.PRINTER_IP || "192.168.1.25";
const printerPort = process.env.PRINTER_PORT || 9100;
const restaurantId = process.env.RESTAURANT_ID || "amiralmomenin";
const MAIN_API_URL = process.env.MAIN_API_URL || "http://localhost:3000";
const POLL_INTERVAL = 2000; // Check every 2 seconds

app.use(cors());
app.use(express.json());

// Generate HTML from Order Data
function generateReceiptHTML(order) {
  const orderNum = order.id || "ORD-2025-000001";
  const date = order.date || new Date().toLocaleDateString("fa-IR");
  const time = order.time || new Date().toLocaleTimeString("fa-IR");
  const kitchenCode = order.kitchenNumber || "000";

  const items = order.items || [];
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td class="qty">${item.qty}</td>
        <td class="name">${item.name}</td>
      </tr>
    `
    )
    .join("");

  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Kitchen Receipt</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
      body {
        width: 570px;
        max-width: 570px;
        direction: rtl;
        font-family: Arial, sans-serif;
        padding: 6px 10px 12px;
        box-sizing: border-box;
        color: #000;
      }
      .brand {
        text-align: center;
        font-size: 34px;
        font-weight: 900;
        margin: 0;
        padding-top: 2px;
      }
      .kitchen-header {
        text-align: center;
        background: #000;
        color: #fff;
        padding: 6px;
        font-size: 20px;
        font-weight: bold;
        margin: 10px 0 12px 0;
        border-radius: 6px;
      }
      .info-box {
        border: 2px solid #000;
        padding: 10px 12px;
        margin-bottom: 12px;
        border-radius: 6px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid #e0e0e0;
        font-size: 20px;
      }
      .info-row:last-child { border-bottom: none; }
      .info-row.mega2 { font-size: 36px; font-weight: 900; }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        table-layout: fixed;
      }
      .items-table thead th {
        padding: 8px 10px;
        font-size: 18px;
        border: 1px solid #000;
        background: #fafafa;
      }
      .items-table tbody td {
        padding: 10px;
        font-size: 24px;
        border: 1px solid #000;
        vertical-align: middle;
        word-break: break-word;
      }
      .items-table .qty-col, .items-table td.qty {
        width: 110px;
        text-align: center;
        font-weight: 800;
        font-size: 32px;
      }
      .items-table .name-col, .items-table td.name {
        text-align: right;
        padding-right: 14px;
        font-size: 26px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        margin-top: 6px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="brand">UNIFOOD</div>
    <div class="kitchen-header">سفارش آشپزخانه</div>
    <div class="info-box">
      <div class="info-row">
        <span>شماره سفارش:</span>
        <span>${orderNum}</span>
      </div>
      <div class="info-row mega2">
        <span>کد آشپزخانه:</span>
        <span>${kitchenCode}</span>
      </div>
      <div class="info-row">
        <span>زمان:</span>
        <span>${time}</span>
      </div>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th class="qty-col">تعداد</th>
          <th class="name-col">نام آیتم</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    <div class="footer">
      UNIFOOD Kitchen • ${date}
    </div>
  </body>
  </html>`;
}

// Print HTML using Puppeteer
async function printHTML(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 570, height: 1600, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const clipHeight = Math.ceil(bodyHeight + 20);

  const imagePath = path.join(__dirname, "receipt.png");
  await page.screenshot({
    path: imagePath,
    clip: { x: 0, y: 0, width: 570, height: clipHeight },
  });

  await browser.close();

  const device = new escpos.Network(printerIP, printerPort);
  const printer = new escpos.Printer(device);

  return new Promise((resolve, reject) => {
    const maxWait = 2000;
    const start = Date.now();

    (function tryLoad() {
      if (fs.existsSync(imagePath)) {
        escpos.Image.load(imagePath, (image) => {
          device.open((err) => {
            if (err) {
              reject(err);
              return;
            }
            printer.align("ct").raster(image).cut().close();
            resolve();
          });
        });
      } else if (Date.now() - start < maxWait) {
        setTimeout(tryLoad, 50);
      } else {
        reject(new Error("Receipt image not created."));
      }
    })();
  });
}

// ✅ NEW: Poll print queue and process orders
async function pollPrintQueue() {
  try {
    const response = await fetch(
      `${MAIN_API_URL}/api/print-queue?restaurantId=${restaurantId}`
    );

    if (!response.ok) {
      console.error("Failed to fetch print queue:", response.statusText);
      return;
    }

    const queue = await response.json();

    if (queue.length === 0) {
      return; // No orders to print
    }

    console.log(`📋 Found ${queue.length} order(s) in print queue`);

    for (const order of queue) {
      try {
        console.log(`🖨️ Printing order: ${order.id}`);
        const html = generateReceiptHTML(order);
        await printHTML(html);

        // ✅ Remove from queue after successful print
        const deleteResponse = await fetch(
          `${MAIN_API_URL}/api/print-queue/${order.id}`,
          { method: "DELETE" }
        );

        if (deleteResponse.ok) {
          console.log(`✅ Order ${order.id} printed and removed from queue`);
        } else {
          console.error(`⚠️ Failed to remove order ${order.id} from queue`);
        }
      } catch (printError) {
        console.error(`❌ Failed to print order ${order.id}:`, printError);
        // Don't remove from queue if printing failed - will retry next poll
      }
    }
  } catch (error) {
    console.error("❌ Polling error:", error.message);
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    restaurant: restaurantId,
    printer: `${printerIP}:${printerPort}`,
    uptime: process.uptime(),
  });
});

// Manual print endpoint (for testing)
app.post("/print-order", async (req, res) => {
  try {
    const orderData = req.body.order;
    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: "No order data provided.",
      });
    }

    console.log(`🖨️ Manual print request for order: ${orderData.id}`);
    const html = generateReceiptHTML(orderData);
    await printHTML(html);

    console.log(`✅ Receipt printed successfully`);
    res.json({ success: true, message: "Receipt printed successfully." });
  } catch (error) {
    console.error("❌ Print error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`🖨️ Print Server running at http://localhost:${port}`);
  console.log(`📡 Restaurant: ${restaurantId}`);
  console.log(`🖨️ Printer: ${printerIP}:${printerPort}`);
  console.log(`🔄 Polling interval: ${POLL_INTERVAL}ms`);
});

// ✅ Start polling the print queue
console.log(`🔄 Starting print queue polling...`);
setInterval(pollPrintQueue, POLL_INTERVAL);

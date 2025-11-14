const puppeteer = require("puppeteer");
const escpos = require("escpos");
escpos.Network = require("escpos-network");
const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3001;

// --- Printer Configuration ---
const printerIP = "192.168.1.25";
const printerPort = 9100;

app.use(cors());
app.use(express.json());

// --- Generate HTML from Order Data ---
function generateReceiptHTML(order) {
  const orderNum = order.id || "ORD-2025-000001";
  const date = order.date || new Date().toLocaleDateString("fa-IR");
  const cashier = order.cashier || "مدیر";
  const time = order.time || new Date().toLocaleTimeString("fa-IR");
  const kitchenCode = order.kitchenNumber || "000";
  const orderType = order.orderType || "میزی";

  const items = order.items || [
    { name: "چلوکباب کوبیده", qty: 3 },
    { name: "جلو جوجه", qty: 2 },
    { name: "جلو تابه کبابی", qty: 2 },
  ];

  // item rows: qty column first (left in DOM but will be displayed on left because of RTL header ordering)
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
      /* Page */
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
      }

      body {
        width: 570px;            /* your chosen width */
        max-width: 570px;
        direction: rtl;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
        padding: 6px 10px 12px;  /* reduced top padding to move content up */
        box-sizing: border-box;
        color: #000;
      }

      /* Branding */
      .brand {
        text-align: center;
        font-size: 34px;
        font-weight: 900;
        margin: 0;               /* removed top gap */
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

      /* Info box */
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

      .info-row.large { font-size: 24px; font-weight: 700; }
      .info-row.mega { font-size: 28px; font-weight: 800; }
      .info-row.mega2 { font-size: 36px; font-weight: 900; }

      /* Items table */
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        table-layout: fixed; /* make columns obey widths */
      }

      /* table header: keep same column order as tbody */
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

      /* column width management: qty narrower, name takes the rest */
      .items-table .qty-col, .items-table td.qty {
        width: 110px;
        text-align: center;
        font-weight: 800;
        font-size: 32px;
      }

      .items-table .name-col, .items-table td.name {
        /* remaining width */
        text-align: right;
        padding-right: 14px;
        font-size: 26px;
      }

      /* Add subtle separation line under header and above footer */
      .divider {
        border-top: 1px dashed #000;
        margin: 8px 0;
      }

      /* Footer */
      .footer {
        text-align: center;
        font-size: 14px;
        margin-top: 6px;
        color: #333;
      }

      /* Ensure everything prints compactly */
      .small { font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="brand">UNIFOOD</div>

    <div class="kitchen-header">سفارش آشپزخانه</div>

    <div class="info-box">
      <div class="info-row large">
        <span>شماره سفارش:</span>
        <span>${orderNum}</span>
      </div>

      <div class="info-row mega2">
        <span>کد اشتراک:</span>
        <span>${kitchenCode}</span>
      </div>

      <div class="info-row mega">
        <span>نوع سفارش:</span>
        <span>${orderType}</span>
      </div>

      <div class="info-row">
        <span>زمان:</span>
        <span>${time}</span>
      </div>
    </div>

    <table class="items-table" role="table" aria-label="Order Items">
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

    <div class="divider"></div>

    <div class="footer">
      لطفاً سفارش را با دقت آماده کنید
      <br />
      UNIFOOD Kitchen • ${date}
    </div>
  </body>
  </html>`;
}

// --- Print HTML using Puppeteer ---
async function printHTML(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Force receipt width to match your thermal printer width (you picked 570)
  await page.setViewport({
    width: 570,
    height: 1600,
    deviceScaleFactor: 1,
  });

  await page.setContent(html, { waitUntil: "networkidle0" });

  // Measure full page height and add a small bottom margin so footer never gets cut
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const clipHeight = Math.ceil(bodyHeight + 20); // 20px extra bottom margin

  const imagePath = path.join(__dirname, "receipt.png");

  await page.screenshot({
    path: imagePath,
    clip: {
      x: 0,
      y: 0,
      width: 570,
      height: clipHeight,
    },
  });

  await browser.close();

  // Print using ESC/POS + LAN
  const device = new escpos.Network(printerIP, printerPort);
  const printer = new escpos.Printer(device);

  return new Promise((resolve, reject) => {
    // Ensure the image file exists before loading (brief retry loop)
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

// --- API Endpoints ---
app.post("/print-order", async (req, res) => {
  try {
    const orderData = req.body.order;
    if (!orderData)
      return res
        .status(400)
        .json({ success: false, message: "No order data provided." });

    const html = generateReceiptHTML(orderData);
    await printHTML(html);

    res.json({ success: true, message: "Receipt printed successfully." });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/preview-receipt", async (req, res) => {
  try {
    const html = generateReceiptHTML(req.body.order || {});
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`🖨️ Print Server running at http://localhost:${port}`);
  console.log(`📡 Printer IP: ${printerIP}:${printerPort}`);
});

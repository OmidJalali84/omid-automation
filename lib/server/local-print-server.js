// local-print-server.js
const express = require("express");
const net = require("net");
const iconv = require("iconv-lite");
const cors = require("cors"); // To allow requests from your Next.js app

const app = express();
const port = 3001; // Choose a port for your local server

// --- Printer Configuration (Same as your script) ---
const printerIP = "192.168.1.25";
const printerPort = 9100;

app.use(cors());
app.use(express.json()); // To parse JSON request body

// --- Printing Function ---
function printReceipt(order) {
  const client = new net.Socket();

  // Format the order data into a printable receipt string (in Farsi)
  let receipt = "";
  receipt += "--------------------------------------\n";
  receipt += `رستوران: ${order.restaurant}\n`;
  receipt += `تاریخ: ${order.date} - ساعت: ${order.time}\n`;
  receipt += `کد سفارش: ${order.id}\n`;
  receipt += `شماره آشپزخانه: #${order.kitchenNumber}\n`;
  receipt += "--------------------------------------\n";
  receipt += "آیتم‌ها:\n";

  order.items.forEach((item) => {
    receipt += `${item.name} (تعداد: ${
      item.qty
    }) - ${item.price.toLocaleString()} تومان\n`;
  });

  receipt += "--------------------------------------\n";
  receipt += `جمع کل: ${order.total.toLocaleString()} تومان\n`;
  if (order.jettonWorth > 0) {
    receipt += `ارزش ژتون: -${order.jettonWorth.toLocaleString()} تومان\n`;
  }
  receipt += `مبلغ پرداختی: ${order.paid.toLocaleString()} تومان\n`;
  receipt += "======================================\n";
  receipt += "با تشکر از خرید شما\n";

  // You can add more formatting/logos/QR codes here

  console.log("Attempting to print:\n", receipt);

  client.connect(printerPort, printerIP, () => {
    console.log("✅ Connected to printer");

    // 1️⃣ تنظیم CodePage به 1256 (فارسی/عربی)
    client.write(Buffer.from([0x1b, 0x74, 0x16])); // ESC t 22 (CodePage 1256)

    // 2️⃣ تبدیل متن به Windows-1256
    const encoded = iconv.encode(receipt, "windows-1256");
    client.write(encoded);

    // 3️⃣ فید کاغذ (چند خط خالی)
    client.write(Buffer.from([0x0a, 0x0a, 0x0a])); // \n\n\n

    // 4️⃣ برش کاغذ
    client.write(Buffer.from([0x1d, 0x56, 0x00])); // GS V 0

    client.end();
    console.log("✅ Print job sent.");
  });

  client.on("error", (err) => {
    console.error("❌ Printer connection error:", err.message);
  });
}

// --- API Endpoint ---
app.post("/print-order", (req, res) => {
  const orderData = req.body.order;

  if (!orderData) {
    return res
      .status(400)
      .json({ success: false, message: "No order data provided." });
  }

  printReceipt(orderData);
  res.json({ success: true, message: "Print job initiated." });
});

app.listen(port, () => {
  console.log(`Local Print Server running at http://localhost:${port}`);
});

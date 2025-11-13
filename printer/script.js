const net = require("net");
const iconv = require("iconv-lite");

const printerIP = "192.168.1.25";
const printerPort = 9100;

const message = "کیر تو احمد\n";

const client = new net.Socket();

client.connect(printerPort, printerIP, () => {
  console.log("✅ Connected to printer");

  // 1️⃣ تنظیم CodePage به 1256 (فارسی/عربی)
  client.write(Buffer.from([0x1b, 0x74, 0x16])); // ESC t 22 (CodePage 1256)

  // 2️⃣ تبدیل متن به Windows-1256
  const encoded = iconv.encode(message, "windows-1256");
  client.write(encoded);

  // 3️⃣ فید کاغذ (چند خط خالی)
  client.write("\n\n\n");

  // 4️⃣ برش کاغذ
  client.write(Buffer.from([0x1d, 0x56, 0x00])); // GS V 0

  client.end();
});

client.on("error", (err) => {
  console.error("❌ Printer connection error:", err.message);
});

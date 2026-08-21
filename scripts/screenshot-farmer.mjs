import { chromium } from "playwright";

const out = process.argv[2] || ".";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:5173/farmer", {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector("text=No smartphone required");
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/phone-idle.png` });

await page.click('button:has-text("Play the call")');

// dialing
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/phone-dialing.png` });

// mid-call
await page.waitForSelector("text=I have 120 bags of maize.", { timeout: 20000 });
await page.screenshot({ path: `${out}/phone-call.png` });

// end
await page.waitForSelector("text=SMS confirmation sent", { timeout: 40000 });
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/phone-done.png` });

console.log("errors:", errors);
console.log("SCREENSHOT_OK");
await browser.close();

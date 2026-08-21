import { chromium } from "playwright";

const out = process.argv[2] || ".";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:5173/farmer", {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector("text=Add supply by phone");
await page.screenshot({ path: `${out}/farmer-idle.png` });

await page.click('button:has-text("Call gather")');

// mid-call: wait until the farmer has answered at least once
await page.waitForSelector("text=I have 120 bags of maize.", {
  timeout: 15000,
});
await page.screenshot({ path: `${out}/farmer-call.png` });

// end state
await page.waitForSelector("text=Supply added", { timeout: 30000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/farmer-done.png`, fullPage: true });

console.log("errors:", errors);
console.log("SCREENSHOT_OK");
await browser.close();

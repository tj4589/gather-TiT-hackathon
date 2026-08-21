import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });
await page.waitForSelector("text=What do you want to buy?");
await page.screenshot({ path: process.argv[2] });

await page.fill('input[type="text"]', "I need 1000 bags of maize in Kaduna within 3 days");
await page.click('button:has-text("Continue")');
await page.waitForSelector("text=Here's what we heard");
await page.waitForTimeout(300);
await page.screenshot({ path: process.argv[3] });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
console.log("errors:", errors);
console.log("SCREENSHOT_OK");
await browser.close();

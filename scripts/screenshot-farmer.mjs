import { chromium } from "playwright";

const out = process.argv[2] || ".";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1060, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:5173/farmer", {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector("text=No smartphone required");
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/p-idle.png` });

// --- verified path ---
await page.click('button:has-text("Play verified call")');

await page.waitForSelector("text=Checking the register…", { timeout: 20000 });
await page.screenshot({ path: `${out}/p-verify.png` });

await page.waitForSelector("text=Is your name Amina Yusuf?", { timeout: 20000 });
await page.screenshot({ path: `${out}/p-name.png` });

await page.waitForSelector("text=gather farmer ID created", { timeout: 25000 });
await page.screenshot({ path: `${out}/p-registered.png` });

await page.waitForSelector("text=SMS confirmation sent", { timeout: 45000 });
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/p-done.png` });

// --- rejected path ---
await page.click('button:has-text("Reset")');
await page.waitForSelector('button:has-text("Play unverified call")');
await page.click('button:has-text("Play unverified call")');

await page.waitForSelector("text=Cannot proceed", { timeout: 30000 });
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/p-rejected.png` });

console.log("errors:", errors);
console.log("SCREENSHOT_OK");
await browser.close();

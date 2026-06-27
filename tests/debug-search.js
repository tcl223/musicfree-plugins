"use strict";
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function downloadSDK() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture the SDK JS file
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("migusdk")) {
      console.log("Found SDK:", url);
      try {
        const body = await response.text();
        const filename = path.join(__dirname, "..", ".debug", "migusdk.js");
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, body, "utf8");
        console.log("Saved SDK to", filename, "size:", body.length);
      } catch (e) {
        console.error("Save error:", e.message);
      }
    }
  });

  console.log("Loading Migu website to capture SDK...");
  await page.goto("https://music.migu.cn/v3", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  
  await browser.close();
  console.log("Done");
}

downloadSDK().catch(e => console.error("Fatal:", e.message));

import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(root, "../Echo Receptionist Portfolio/package.json"));
const puppeteer = require("puppeteer");

const W = 1920;
const H = 1080;
const SCALE = 4;

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--allow-file-access-from-files", "--font-render-hinting=none", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
await page.goto(pathToFileURL(path.join(root, "02-website.html")).href, {
  waitUntil: "networkidle0",
  timeout: 120000,
});
await page.evaluateHandle("document.fonts.ready");
await new Promise((r) => setTimeout(r, 400));
const el = await page.$(".artboard");
await el.screenshot({
  path: path.join(root, "02-website.png"),
  type: "png",
  omitBackground: false,
  captureBeyondViewport: true,
});
await browser.close();
console.log(`Wrote 02-website.png at ${W * SCALE} x ${H * SCALE}`);

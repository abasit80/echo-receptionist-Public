import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(root, "../Echo Receptionist Portfolio/package.json"));
const puppeteer = require("puppeteer");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCALE = 3;

const jobs = [
  {
    html: "echo-receptionist-thumbnail.html",
    selector: ".artboard",
    out: "EchoReceptionist-Thumbnail.png",
    width: 1920,
    height: 1080,
  },
  {
    html: "echo-thumbs-hires.html",
    selector: "#ipad",
    out: "01-ipad.png",
    width: 2400,
    height: 1800,
  },
  {
    html: "echo-thumbs-hires.html",
    selector: "#website",
    out: "02-website.png",
    width: 2400,
    height: 1800,
  },
  {
    html: "echo-thumbs-hires.html",
    selector: "#iphone",
    out: "03-iphone.png",
    width: 2400,
    height: 1800,
  },
  {
    html: "echo-thumbs-hires.html",
    selector: "#ipad-hands",
    out: "04-ipad-hands.png",
    width: 2400,
    height: 1800,
  },
];

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: [
    "--allow-file-access-from-files",
    "--disable-web-security",
    "--font-render-hinting=none",
    "--enable-font-antialiasing",
    "--hide-scrollbars",
  ],
});

for (const job of jobs) {
  const page = await browser.newPage();
  await page.setViewport({
    width: job.width,
    height: job.height,
    deviceScaleFactor: SCALE,
  });
  await page.goto(pathToFileURL(path.join(root, job.html)).href, {
    waitUntil: "networkidle0",
    timeout: 180000,
  });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 500));
  const el = await page.$(job.selector);
  if (!el) throw new Error(`Missing ${job.selector} in ${job.html}`);
  const out = path.join(root, job.out);
  await el.screenshot({
    path: out,
    type: "png",
    omitBackground: false,
    captureBeyondViewport: true,
  });
  console.log(`Wrote ${out}`);
  await page.close();
}

await browser.close();

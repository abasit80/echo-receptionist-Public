import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(root, "../Echo Receptionist Portfolio/package.json"));
const puppeteer = require("puppeteer");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCALE = 4;

const photos = [
  ["photo-01.png", "01-ipad.png"],
  ["photo-02.png", "02-website.png"],
  ["photo-03.png", "03-iphone.png"],
  ["photo-04.png", "04-ipad-hands.png"],
];

const srcDir =
  "C:\\Users\\iQra tRaders\\.cursor\\projects\\c-Users-iQra-tRaders-Desktop-Echo-Receptionist-AI\\assets";

await fs.copyFile(path.join(srcDir, "echo-photo-01-ipad.png"), path.join(root, "photo-01.png"));
await fs.copyFile(path.join(srcDir, "echo-photo-02-website.png"), path.join(root, "photo-02.png"));
await fs.copyFile(path.join(srcDir, "echo-photo-03-iphone.png"), path.join(root, "photo-03.png"));
await fs.copyFile(path.join(srcDir, "echo-photo-04-ipad.png"), path.join(root, "photo-04.png"));

const html = `<!DOCTYPE html>
<html><body style="margin:0;background:#000">
<canvas id="c"></canvas>
<script>
const src = new URLSearchParams(location.search).get("src");
const scale = Number(new URLSearchParams(location.search).get("scale") || 4);
const img = new Image();
img.onload = () => {
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const c = document.getElementById("c");
  c.width = w; c.height = h;
  c.style.width = w + "px";
  c.style.height = h + "px";
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  document.body.dataset.ready = "1";
};
img.src = src;
</script>
</body></html>`;

await fs.writeFile(path.join(root, "_upscale.html"), html);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: ["--allow-file-access-from-files", "--disable-web-security", "--hide-scrollbars"],
});

for (const [srcName, outName] of photos) {
  const page = await browser.newPage();
  const srcUrl = pathToFileURL(path.join(root, srcName)).href;
  const pageUrl = pathToFileURL(path.join(root, "_upscale.html")).href + `?src=${encodeURIComponent(srcUrl)}&scale=4`;
  await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 120000 });
  await page.waitForFunction(() => document.body.dataset.ready === "1", { timeout: 60000 });
  const canvas = await page.$("canvas");
  const box = await canvas.boundingBox();
  await page.setViewport({
    width: Math.ceil(box.width),
    height: Math.ceil(box.height),
    deviceScaleFactor: 1,
  });
  await canvas.screenshot({
    path: path.join(root, outName),
    type: "png",
    omitBackground: false,
  });
  console.log("Wrote", outName, Math.round(box.width), "x", Math.round(box.height));
  await page.close();
}

const cine = await browser.newPage();
await cine.setViewport({ width: 1920, height: 1080, deviceScaleFactor: SCALE });
await cine.goto(pathToFileURL(path.join(root, "echo-receptionist-thumbnail.html")).href, {
  waitUntil: "networkidle0",
  timeout: 180000,
});
await cine.evaluateHandle("document.fonts.ready");
await new Promise((r) => setTimeout(r, 400));
const board = await cine.$(".artboard");
await board.screenshot({
  path: path.join(root, "EchoReceptionist-Thumbnail.png"),
  type: "png",
  omitBackground: false,
  captureBeyondViewport: true,
});
console.log("Wrote EchoReceptionist-Thumbnail.png at", 1920 * SCALE, "x", 1080 * SCALE);
await cine.close();

await browser.close();

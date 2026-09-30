import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const root = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(root, "echo-receptionist-case-study.html");
const pdfPath = path.join(root, "EchoReceptionist-Client-Case-Study.pdf");

const CSS_W = 1782;
const CSS_H = 1260;
const SCALE = 3;

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--allow-file-access-from-files",
    "--disable-web-security",
    "--font-render-hinting=none",
    "--enable-font-antialiasing",
    "--hide-scrollbars",
  ],
});

const page = await browser.newPage();
await page.setViewport({
  width: CSS_W,
  height: CSS_H,
  deviceScaleFactor: SCALE,
});
await page.goto(pathToFileURL(htmlPath).href, {
  waitUntil: "networkidle0",
  timeout: 120000,
});
await page.evaluateHandle("document.fonts.ready");
await page.addStyleTag({
  content: `
    html { scroll-snap-type: none !important; }
    body { overflow: hidden !important; }
    .slide {
      width: ${CSS_W}px !important;
      height: ${CSS_H}px !important;
      min-height: ${CSS_H}px !important;
      max-height: ${CSS_H}px !important;
      page-break-after: auto !important;
    }
  `,
});
await new Promise((resolve) => setTimeout(resolve, 800));

const slides = await page.$$(".slide");
if (!slides.length) {
  await browser.close();
  throw new Error("No slides found");
}

const pngs = [];
for (const slide of slides) {
  pngs.push(
    await slide.screenshot({
      type: "png",
      omitBackground: false,
      captureBeyondViewport: true,
    })
  );
}

await browser.close();

const pdf = await PDFDocument.create();
const A4_W = 841.89;
const A4_H = 595.28;

for (const png of pngs) {
  const image = await pdf.embedPng(png);
  const sheet = pdf.addPage([A4_W, A4_H]);
  sheet.drawImage(image, {
    x: 0,
    y: 0,
    width: A4_W,
    height: A4_H,
  });
}

await fs.writeFile(pdfPath, await pdf.save({ useObjectStreams: false }));
console.log(`Wrote ${pdfPath} (${pngs.length} slides @ ${SCALE}x / ~${Math.round((CSS_W * SCALE) / 11.69)} DPI)`);

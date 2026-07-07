// Generate PWA icons from logo.png (replace old 5-elements design with brand logo).
// Outputs: app-icon-192, app-icon-512, app-icon-maskable-512 (safe-zone), apple-icon.
// Run: node scripts/generate-pwa-icons.mjs
import sharp from "sharp";

const SRC = "public/assets/brand/logo.png";
const MASK_BG = "#f7f0df"; // ตรง manifest background_color

// app-icon-192 (purpose: any)
await sharp(SRC)
  .resize(192, 192, { fit: "cover", kernel: "lanczos3" })
  .png()
  .toFile("public/assets/pwa/app-icon-192.png");

// app-icon-512 (purpose: any) — logo เดิม 500px → upscale นิด
await sharp(SRC)
  .resize(512, 512, { fit: "cover", kernel: "lanczos3" })
  .png()
  .toFile("public/assets/pwa/app-icon-512.png");

// app-icon-maskable-512 — ivory canvas + logo 360px กลาง (safe zone ~70% กัน Android mask ตัด)
const logo360 = await sharp(SRC)
  .resize(360, 360, { fit: "cover", kernel: "lanczos3" })
  .png()
  .toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 3, background: MASK_BG },
})
  .composite([{ input: logo360, gravity: "center" }])
  .png()
  .toFile("public/assets/pwa/app-icon-maskable-512.png");

// apple-icon (180) — iOS ไม่ mask, ใช้ logo ตรง
await sharp(SRC)
  .resize(180, 180, { fit: "cover", kernel: "lanczos3" })
  .png()
  .toFile("public/assets/pwa/apple-icon.png");

console.log("PWA icons generated from logo.png");

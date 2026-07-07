// Resize m1-m5 brand illustrations (1254px PNG ~2.8MB each) → 768px webp <500KB.
// Run: node scripts/resize-mascots.mjs
import sharp from "sharp";
import { statSync } from "fs";

const FILES = ["m1", "m2", "m3", "m4", "m5"];
const SIZE = 768;
const LIMIT = 500 * 1024;

let allOk = true;
for (const name of FILES) {
  const input = `public/assets/brand/${name}.png`;
  const output = `public/assets/brand/${name}.webp`;
  const before = statSync(input).size;
  await sharp(input)
    .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(output);
  const after = statSync(output).size;
  const ok = after < LIMIT;
  if (!ok) allOk = false;
  console.log(
    `${name}.png ${(before / 1024).toFixed(0)}KB → ${name}.webp ${(after / 1024).toFixed(0)}KB ${ok ? "✓" : "✗ OVER 500KB"}`,
  );
}
console.log(allOk ? "\nAll under 500KB ✓" : "\nSome over limit — reduce SIZE/quality");

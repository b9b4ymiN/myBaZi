// Optimize character avatars — แปลง 10 Heavenly Stems PNG (1254px, ~1.6MB each)
// เป็น webp 3 ขนาด (256/512/1024) สำหรับ next/image responsive srcset.
// รัน: pnpm assets:optimize
import sharp from "sharp";
import { mkdir, stat, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DIR = join(ROOT, "public", "assets", "character");
const RAW_DIR = join(ROOT, "raw-assets", "character"); // PNG ดิบย้ายมาที่นี่ (นอก public)
const SIZES = [256, 512, 1024];
const QUALITY = 85;

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

async function exists(p) {
  return existsSync(p);
}

async function main() {
  const moveRaw = process.argv.includes("--move-raw");
  console.log(`optimize-characters: ${STEMS.length} stems × ${SIZES.length} sizes = ${STEMS.length * SIZES.length} files`);

  let totalOut = 0;
  let totalIn = 0;
  const report = [];

  for (const stem of STEMS) {
    const src = join(SRC_DIR, `${stem}.png`);
    if (!(await exists(src))) {
      console.warn(`  ⚠ missing: ${src}`);
      continue;
    }
    const inSize = (await stat(src)).size;
    totalIn += inSize;

    for (const size of SIZES) {
      const out = join(SRC_DIR, `${stem}-${size}.webp`);
      await sharp(src)
        .resize(size, size, { fit: "contain" }) // รักษา aspect + transparency
        .webp({ quality: QUALITY, alphaQuality: 90 })
        .toFile(out);
      const outSize = (await stat(out)).size;
      totalOut += outSize;
      report.push({ stem, size, outSize });
    }
    console.log(`  ✓ ${stem}: ${(inSize / 1024).toFixed(0)}KB → ${SIZES.map((s) => {
      const o = report.find((r) => r.stem === stem && r.size === s);
      return `${s}=${(o.outSize / 1024).toFixed(0)}KB`;
    }).join(" ")}`);
  }

  console.log(`\ntotal: ${(totalIn / 1024 / 1024).toFixed(2)}MB PNG → ${(totalOut / 1024 / 1024).toFixed(2)}MB webp (${((1 - totalOut / totalIn) * 100).toFixed(0)}% smaller)`);

  const oversized = report.filter((r) => r.outSize > 200 * 1024);
  if (oversized.length) {
    console.warn(`\n⚠ ${oversized.length} files > 200KB:`);
    for (const o of oversized) console.warn(`   ${o.stem}-${o.size}.webp = ${(o.outSize / 1024).toFixed(0)}KB`);
  } else {
    console.log(`✓ ทุกไฟล์ < 200KB`);
  }

  if (moveRaw) {
    if (!(await exists(RAW_DIR))) await mkdir(RAW_DIR, { recursive: true });
    for (const stem of STEMS) {
      const src = join(SRC_DIR, `${stem}.png`);
      if (await exists(src)) {
        await rename(src, join(RAW_DIR, `${stem}.png`));
      }
    }
    console.log(`\n✓ ย้าย PNG ดิบไป ${RAW_DIR.replace(ROOT + "/", "")}/`);
  } else {
    console.log(`\n(ยังไม่ย้าย PNG ดิบ — รันด้วย --move-raw หลัง verify webp แล้ว)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

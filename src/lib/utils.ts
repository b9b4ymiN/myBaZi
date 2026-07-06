import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format "YYYY-MM-DD" → วันที่ไทย โดยไม่ขึ้นกับ timezone ของเครื่อง
 * ป้องกัน bug: new Date("YYYY-MM-DD") parse เป็น UTC midnight แล้ว toLocaleDateString
 * เหลื่อมเป็นวันก่อนใน timezone ที่อยู่หลัง UTC (เช่น container/server ที่ TZ=US)
 * → parse เป็น local year/month/day ตรงๆ แทน
 */
export function formatThaiDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const parts = dateStr.split("-").map(Number);
  const [y, m, d] = parts;
  if (parts.length !== 3 || !y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", options);
}

/**
 * UUID v4 ที่ทำงานได้บน insecure context (HTTP) ด้วย
 * crypto.randomUUID ต้องการ secure context (HTTPS/localhost) —
 * บน deploy ที่ไม่มี HTTPS มัน undefined ทำให้สร้าง profile/chat ไม่ได้
 * fallback ไปใช้ crypto.getRandomValues (มีบนทุก context)
 */
export function getSafeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

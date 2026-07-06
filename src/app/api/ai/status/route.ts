/**
 * เช็คสถานะ AI config ฝั่ง server — สำหรับ UI gate
 * ไม่ return key/endpoint/model เด็ดขาด เพียงแค่ ok เท่านั้น
 */

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const ok = !!(
    process.env.AI_API_KEY &&
    process.env.AI_ENDPOINT &&
    process.env.AI_MODEL
  );

  return Response.json({ ok });
}

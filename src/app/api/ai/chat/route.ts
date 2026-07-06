/**
 * Server-side proxy สำหรับ OpenAI-compatible chat completion.
 *
 * เหตุผล: apiKey ต้องอยู่ฝั่ง server เท่านั้น (อ่านจาก process.env) เพื่อไม่ให้
 * leak สู่ browser. browser เรียก route นี้แทนการ fetch endpoint ตรง.
 *
 * เป็น thin proxy: ส่งต่อทั้ง stream (SSE) และ non-stream (JSON) response
 * กลับไป browser โดยไม่ parse เนื้อหา — client parse เองเหมือนเดิม.
 */

import type { ChatMessage } from "@/lib/ai/client";

export const runtime = "nodejs";

interface ChatRequestBody {
  messages?: ChatMessage[];
  stream?: boolean;
}

/** Soft cap ป้องกัน abuse เบื้องต้น (shared key) — จำกัดขนาด payload. */
const MAX_BODY_BYTES = 200_000; // ~200 KB

function envConfigured(): boolean {
  return !!(process.env.AI_API_KEY && process.env.AI_ENDPOINT && process.env.AI_MODEL);
}

export async function POST(req: Request): Promise<Response> {
  if (!envConfigured()) {
    return Response.json(
      {
        error: {
          message: "AI ยังไม่ได้ตั้งค่าบน server (AI_API_KEY / AI_ENDPOINT / AI_MODEL)",
          type: "config_missing",
        },
      },
      { status: 503 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json(
      { error: { message: "Invalid JSON body", type: "bad_request" } },
      { status: 400 }
    );
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: { message: "messages ต้องเป็น array ที่ไม่ว่าง", type: "bad_request" } },
      { status: 400 }
    );
  }

  // Soft cap: รวมความยาว content ทุกข้อความ
  const totalLen = messages.reduce(
    (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
    0
  );
  if (totalLen > MAX_BODY_BYTES) {
    return Response.json(
      {
        error: {
          message: "ข้อความยาวเกินขีดจำกัด กรุณาสั้นลง",
          type: "payload_too_large",
        },
      },
      { status: 413 }
    );
  }

  const temperature = Number(process.env.AI_TEMPERATURE ?? 0.7);
  const stream = body.stream === true;

  let upstream: Response;
  try {
    upstream = await fetch(process.env.AI_ENDPOINT as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY as string}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages,
        temperature,
        stream,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return Response.json(
      { error: { message: `ไม่สามารถเชื่อมต่อ AI endpoint: ${message}`, type: "upstream_error" } },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => upstream.statusText);
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Passthrough: SSE (stream) หรือ JSON (non-stream) — client parse เอง
  const contentType = upstream.headers.get("content-type") ?? "application/json";
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

export async function GET(): Promise<Response> {
  // ใช้ GET เพื่อความสะดวกตอน debug — แต่ flow จริงใช้ POST
  return Response.json(
    { error: { message: "Use POST", type: "method_not_allowed" } },
    { status: 405 }
  );
}

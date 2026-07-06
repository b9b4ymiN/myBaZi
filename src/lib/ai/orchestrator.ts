/**
 * Orchestrator — รวม 3 Layers ของ Zero Hallucination Engine
 *
 * Layer 1: Natal context injection (buildBaZiContext)
 * Layer 2: Dynamic calc for "other days" (buildDynamicContext)
 * Layer 3: System prompt enforcement (TIANJI_SYSTEM_PROMPT)
 *
 * ห้าม AI คำนวณเอง → ใช้ engine ที่แม่นยำ 100%
 */

import type { Profile, RelationshipRole } from "@/types/profile";
import type { ChatMessage } from "./client";
import { chatCompletion, streamChatCompletion } from "./client";
import { TIANJI_SYSTEM_PROMPT } from "./system-prompt";
import { buildBaZiContext } from "./bazi-context";
import { detectIntent, type DetectedIntent, type SixRelativeTargetRole } from "./intent-detector";
import { buildDynamicContext } from "./dynamic-context";
import { buildRelationshipContext, findRelativeProfile } from "./relationship-context";
import { RELATIONSHIP_ROLE_LABELS } from "@/lib/bazi/relationship-labels";

export interface TianjiRequest {
  /** ข้อมูลผู้ใช้ (required) */
  profile: Profile | null;
  /** ข้อความถามจากผู้ใช้ */
  userMessage: string;
  /** ประวัติการแชท (optional) */
  history?: ChatMessage[];
  /** ปีปัจจุบัน (ค.ศ.) - required for SSR safety */
  currentYear: number;
  /** ทุก profile ใน store — ใช้ resolve relative profile สำหรับคำถาม六亲 (intent + findRelativeProfile) */
  profiles?: Profile[];
}

export interface TianjiResponse {
  /** คำตอบจาก AI */
  reply: string;
  /** Layers ที่ใช้ */
  layersUsed: {
    natal: boolean;
    dynamic: boolean;
    relationship: boolean;
  };
  /** Intent ที่ detect ได้ */
  intent: DetectedIntent;
}

/**
 * สร้าง note เมื่อ user ถามเรื่อง relative แต่ไม่มี profile ของบุคคลนั้นในระบบ
 * (Zero Hallucination — ห้ามเดา แนะนำให้ user เพิ่ม profile)
 */
function buildMissingRelativeNote(targetRole: SixRelativeTargetRole): string {
  const label =
    targetRole === "any-relative"
      ? "คนในครอบครัว/ญาติ"
      : targetRole === "child"
        ? "ลูก"
        : RELATIONSHIP_ROLE_LABELS[targetRole as RelationshipRole] ?? "บุคคลนั้น";

  return [
    "## Relationship Context (ยังไม่มีข้อมูล)",
    "",
    `User ถามเรื่อง **${label}** แต่ยังไม่มี profile ของ${label}ในระบบ`,
    "",
    "- ห้ามเดาหรือวิเคราะห์ความสัมพันธ์จากดวงของตัวเอง — ไม่มีข้อมูลดวงของบุคคลนั้น",
    `- แนะนำ user: "ถ้าต้องการให้วิเคราะห์${label} ช่วยเพิ่ม profile ของ${label}ที่หน้าโปรไฟล์"`,
    "- หาก user ตั้งใจถามดวงตัวเอง (ไม่ใช่ relative) ให้ตอบตาม BaZi Natal Context ปกติ",
  ].join("\n");
}

/**
 * Ask 天机 AI — main entry point
 *
 * @param req - TianjiRequest
 * @returns TianjiResponse
 */
export async function askTianji(req: TianjiRequest): Promise<TianjiResponse> {
  const { profile, userMessage, history = [], currentYear, profiles = [] } = req;

  // ===== Validation =====
  if (!profile) {
    return {
      reply: "กรุณาเลือก profile ก่อนค่ะ/ครับ",
      layersUsed: { natal: false, dynamic: false, relationship: false },
      intent: { intent: "general" },
    };
  }

  // ===== Layer 0: Detect Intent =====
  const intent = detectIntent(userMessage, currentYear);

  // ===== Layer 1: Natal Context Injection =====
  const baZiContext = buildBaZiContext(profile, currentYear, { intent: intent.intent });

  // ===== Layer 2: Dynamic Context (ถ้าจำเป็น) =====
  let dynamicContextText = "";
  let dynamicComputed = false;

  if (intent.intent !== "natal" && intent.intent !== "general") {
    const dynamicResult = await buildDynamicContext(profile, intent, currentYear);
    dynamicContextText = dynamicResult.text;
    dynamicComputed = dynamicResult.computed;
  }

  // ===== Layer 3: System Prompt Enforcement =====
  const systemMessages: ChatMessage[] = [
    {
      role: "system",
      content: TIANJI_SYSTEM_PROMPT,
    },
    {
      role: "system",
      content: `## BaZi Natal Context (ดวงประจำตัว)\n\n${baZiContext.text}`,
    },
  ];

  // ใส่ Dynamic Context ถ้ามี
  if (dynamicContextText && dynamicComputed) {
    systemMessages.push({
      role: "system",
      content: `## Dynamic Context (ข้อมูลวัน/ปีเป้าหมาย)\n\n${dynamicContextText}`,
    });
  }

  // ===== Layer 4: Relationship Context (ถ้าถามเรื่อง六亲) =====
  // resolve relative profile อัตโนมัติตาม role ที่ถาม (N=1) จาก profiles[] ใน store
  let relationshipInjected = false;
  if (intent.intent === "six_relative" && profiles.length > 0) {
    const targetRole = intent.extracted?.targetRole ?? "any-relative";
    const match = findRelativeProfile(profiles, profile, targetRole);
    if (match) {
      const relCtx = buildRelationshipContext(profile, match.profile, currentYear, {
        sameRoleCount: match.sameRoleCount,
      });
      systemMessages.push({
        role: "system",
        content: `## Relationship Context\n\n${relCtx.text}`,
      });
    } else {
      // ถาม relative แต่ไม่มี profile ในระบบ → note แนะนำให้เพิ่ม (Zero Hallucination — ห้ามเดา)
      systemMessages.push({
        role: "system",
        content: buildMissingRelativeNote(targetRole),
      });
    }
    relationshipInjected = true;
  }

  // ===== Chat Completion =====
  const messages: ChatMessage[] = [
    ...systemMessages,
    ...history,
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    const reply = await chatCompletion({
      messages,
    });

    return {
      reply,
      layersUsed: {
        natal: true,
        dynamic: dynamicComputed,
        relationship: relationshipInjected,
      },
      intent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      reply: `ขอโทษค่ะ/ครับ เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ${errorMessage}`,
      layersUsed: { natal: true, dynamic: dynamicComputed, relationship: relationshipInjected },
      intent,
    };
  }
}

export interface TianjiStreamHandlers {
  onDelta: (delta: string) => void;
}

/**
 * Streaming variant of askTianji. Builds the same 3-layer context, then
 * streams tokens via `onDelta`. Returns the final TianjiResponse when done.
 *
 * Unlike `askTianji`, this THROWS on error (after context build) so the
 * caller can decide: keep partial content, or fall back to the non-stream
 * `askTianji`. Validation failures (no profile / disabled) still return a
 * benign reply instead of throwing.
 */
export async function askTianjiStream(
  req: TianjiRequest,
  handlers: TianjiStreamHandlers,
  signal?: AbortSignal
): Promise<TianjiResponse> {
  const { profile, userMessage, history = [], currentYear, profiles = [] } = req;
  const { onDelta } = handlers;

  if (!profile) {
    return {
      reply: "กรุณาเลือก profile ก่อนค่ะ/ครับ",
      layersUsed: { natal: false, dynamic: false, relationship: false },
      intent: { intent: "general" },
    };
  }

  // ===== Layer 0-2: identical to askTianji =====
  const intent = detectIntent(userMessage, currentYear);
  const baZiContext = buildBaZiContext(profile, currentYear, { intent: intent.intent });

  let dynamicContextText = "";
  let dynamicComputed = false;

  if (intent.intent !== "natal" && intent.intent !== "general") {
    const dynamicResult = await buildDynamicContext(profile, intent, currentYear);
    dynamicContextText = dynamicResult.text;
    dynamicComputed = dynamicResult.computed;
  }

  const systemMessages: ChatMessage[] = [
    { role: "system", content: TIANJI_SYSTEM_PROMPT },
    {
      role: "system",
      content: `## BaZi Natal Context (ดวงประจำตัว)\n\n${baZiContext.text}`,
    },
  ];

  if (dynamicContextText && dynamicComputed) {
    systemMessages.push({
      role: "system",
      content: `## Dynamic Context (ข้อมูลวัน/ปีเป้าหมาย)\n\n${dynamicContextText}`,
    });
  }

  // ===== Layer 4: Relationship Context (ถ้าถามเรื่อง六亲) =====
  // resolve relative profile อัตโนมัติตาม role ที่ถาม (N=1) จาก profiles[] ใน store
  let relationshipInjected = false;
  if (intent.intent === "six_relative" && profiles.length > 0) {
    const targetRole = intent.extracted?.targetRole ?? "any-relative";
    const match = findRelativeProfile(profiles, profile, targetRole);
    if (match) {
      const relCtx = buildRelationshipContext(profile, match.profile, currentYear, {
        sameRoleCount: match.sameRoleCount,
      });
      systemMessages.push({
        role: "system",
        content: `## Relationship Context\n\n${relCtx.text}`,
      });
    } else {
      // ถาม relative แต่ไม่มี profile ในระบบ → note แนะนำให้เพิ่ม (Zero Hallucination — ห้ามเดา)
      systemMessages.push({
        role: "system",
        content: buildMissingRelativeNote(targetRole),
      });
    }
    relationshipInjected = true;
  }

  const messages: ChatMessage[] = [
    ...systemMessages,
    ...history,
    { role: "user", content: userMessage },
  ];

  // Throws on stream error — caller handles fallback.
  const reply = await streamChatCompletion(
    { messages, signal },
    { onDelta }
  );

  return {
    reply,
    layersUsed: { natal: true, dynamic: dynamicComputed, relationship: relationshipInjected },
    intent,
  };
}

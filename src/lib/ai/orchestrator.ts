/**
 * Orchestrator — รวม 3 Layers ของ Zero Hallucination Engine
 *
 * Layer 1: Natal context injection (buildBaZiContext)
 * Layer 2: Dynamic calc for "other days" (buildDynamicContext)
 * Layer 3: System prompt enforcement (TIANJI_SYSTEM_PROMPT)
 *
 * ห้าม AI คำนวณเอง → ใช้ engine ที่แม่นยำ 100%
 */

import type { Profile } from "@/types/profile";
import type { AiSettings } from "@/types/ai-settings";
import type { ChatMessage } from "./client";
import { chatCompletion } from "./client";
import { TIANJI_SYSTEM_PROMPT } from "./system-prompt";
import { buildBaZiContext } from "./bazi-context";
import { detectIntent, type DetectedIntent } from "./intent-detector";
import { buildDynamicContext } from "./dynamic-context";

export interface TianjiRequest {
  /** ข้อมูลผู้ใช้ (required) */
  profile: Profile | null;
  /** ข้อความถามจากผู้ใช้ */
  userMessage: string;
  /** ตั้งค่า AI */
  settings: AiSettings;
  /** ประวัติการแชท (optional) */
  history?: ChatMessage[];
  /** ปีปัจจุบัน (ค.ศ.) - required for SSR safety */
  currentYear: number;
}

export interface TianjiResponse {
  /** คำตอบจาก AI */
  reply: string;
  /** Layers ที่ใช้ */
  layersUsed: {
    natal: boolean;
    dynamic: boolean;
  };
  /** Intent ที่ detect ได้ */
  intent: DetectedIntent;
}

/**
 * Ask 天机 AI — main entry point
 *
 * @param req - TianjiRequest
 * @returns TianjiResponse
 */
export async function askTianji(req: TianjiRequest): Promise<TianjiResponse> {
  const { profile, userMessage, settings, history = [], currentYear } = req;

  // ===== Validation =====
  if (!profile) {
    return {
      reply: "กรุณาเลือก profile ก่อนค่ะ/ครับ",
      layersUsed: { natal: false, dynamic: false },
      intent: { intent: "general" },
    };
  }

  if (!settings.enabled) {
    return {
      reply: "กรุณาตั้งค่า AI ในหน้า Settings ก่อนค่ะ/ครับ",
      layersUsed: { natal: false, dynamic: false },
      intent: { intent: "general" },
    };
  }

  // ===== Layer 0: Detect Intent =====
  const intent = detectIntent(userMessage, currentYear);

  // ===== Layer 1: Natal Context Injection =====
  const baZiContext = buildBaZiContext(profile, currentYear);

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
      settings,
    });

    return {
      reply,
      layersUsed: {
        natal: true,
        dynamic: dynamicComputed,
      },
      intent,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      reply: `ขอโทษค่ะ/ครับ เกิดข้อผิดพลาดในการเชื่อมต่อ AI: ${errorMessage}`,
      layersUsed: { natal: true, dynamic: dynamicComputed },
      intent,
    };
  }
}

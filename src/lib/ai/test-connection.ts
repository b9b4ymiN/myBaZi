import { chatCompletion } from './client';
import type { AiSettings } from '@/types/ai-settings';

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  reply?: string;
}

/**
 * Test AI connection with a simple "สวัสดี" message.
 * Returns success if the API responds with valid content.
 */
export async function testAiConnection(
  settings: AiSettings
): Promise<ConnectionTestResult> {
  try {
    // Send a simple test message
    const reply = await chatCompletion({
      messages: [
        {
          role: 'user',
          content: 'สวัสดี ตอบสั้นๆ ว่า "สวัสดีครับ"',
        },
      ],
      settings,
    });

    if (!reply || reply.trim().length === 0) {
      return {
        ok: false,
        message: 'การเชื่อมต่อสำเร็จ แต่ได้รับตอบกลับว่างเปล่า',
      };
    }

    // Basic validation: check if we got a meaningful response
    // The response should be reasonably long for a greeting
    if (reply.length < 2) {
      return {
        ok: false,
        message: 'ได้รับตอบกลับที่สั้นเกินไป',
      };
    }

    return {
      ok: true,
      message: 'เชื่อมต่อสำเร็จ',
      reply: reply.slice(0, 100), // Truncate for display
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        ok: false,
        message: `การเชื่อมต่อล้มเหลว: ${error.message}`,
      };
    }
    return {
      ok: false,
      message: 'การเชื่อมต่อล้มเหลว: ข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    };
  }
}

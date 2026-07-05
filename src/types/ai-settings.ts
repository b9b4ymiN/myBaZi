export interface AiSettings {
  endpoint: string; // e.g. "https://api.z.ai/api/coding/paas/v4/chat/completions"
  apiKey: string; // secret
  model: string; // e.g. "glm-4.6" or "gpt-4o"
  temperature: number; // 0-1, default 0.7
  enabled: boolean; // toggle on/off
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  endpoint: "",
  apiKey: "",
  model: "",
  temperature: 0.7,
  enabled: false,
};

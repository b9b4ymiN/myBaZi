import type { AiSettings } from '@/types/ai-settings';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequestOptions {
  messages: ChatMessage[];
  settings: AiSettings;
  signal?: AbortSignal;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  error?: {
    message: string;
    type?: string;
  };
}

/**
 * OpenAI-compatible chat completion client using browser fetch.
 * Supports any OpenAI-compatible endpoint (e.g., GLM, Azure OpenAI, local models).
 *
 * @throws Error if request fails or returns invalid response
 */
export async function chatCompletion(
  opts: ChatRequestOptions
): Promise<string> {
  const { messages, settings, signal } = opts;

  if (!settings.enabled) {
    throw new Error('AI is disabled in settings');
  }

  if (!settings.endpoint) {
    throw new Error('AI endpoint is not configured');
  }

  if (!settings.apiKey) {
    throw new Error('API key is not configured');
  }

  if (!settings.model) {
    throw new Error('Model name is not configured');
  }

  try {
    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        temperature: settings.temperature,
        stream: false,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `API request failed with status ${response.status}: ${errorText.slice(0, 200)}`
      );
    }

    const data: ChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid API response: no choices returned');
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Invalid API response: missing message content');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw known errors
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
    throw new Error('Unknown error occurred during API request');
  }
}

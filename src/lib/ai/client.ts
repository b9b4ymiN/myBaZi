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

export interface StreamChatHandlers {
  onDelta: (delta: string) => void;
}

/**
 * Streaming variant of chatCompletion. Sends `stream: true`, parses the
 * Server-Sent-Events stream from the OpenAI-compatible endpoint, and invokes
 * `onDelta` for each token chunk. Returns the full accumulated content when
 * the stream terminates (`[DONE]` or stream end).
 *
 * Falls back gracefully: the caller can catch and retry with the non-stream
 * `chatCompletion` if an endpoint refuses streaming.
 */
export async function streamChatCompletion(
  opts: ChatRequestOptions,
  handlers: StreamChatHandlers
): Promise<string> {
  const { messages, settings, signal } = opts;
  const { onDelta } = handlers;

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

  const response = await fetch(settings.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: settings.temperature,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `API request failed with status ${response.status}: ${errorText.slice(0, 200)}`
    );
  }

  if (!response.body) {
    throw new Error('Streaming not supported: response has no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIndex: number;
      while ((nlIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nlIndex).trim();
        buffer = buffer.slice(nlIndex + 1);
        if (!line || !line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') return full;
        let parsed: {
          choices?: Array<{ delta?: { content?: string } }>;
          error?: { message?: string };
        };
        try {
          parsed = JSON.parse(data);
        } catch {
          // Partial JSON across a chunk boundary — the line is only complete
          // once a newline arrives, so this is rare; ignore and continue.
          continue;
        }
        // Explicit server-reported stream error — must surface to the caller.
        if (parsed.error) {
          throw new Error(parsed.error.message ?? 'Stream error');
        }
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    throw error;
  }

  return full;
}

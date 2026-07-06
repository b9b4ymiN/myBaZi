import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSafeUUID } from '@/lib/utils';

export interface ChatMessageUI {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: string;
  layersUsed?: {
    natal: boolean;
    dynamic: boolean;
    relationship: boolean;
  };
  error?: boolean;
}

interface ChatStore {
  messages: ChatMessageUI[];
  isThinking: boolean;
  addMessage: (message: Omit<ChatMessageUI, 'id' | 'timestamp'>) => string;
  appendDelta: (id: string, delta: string) => void;
  patchMessage: (id: string, patch: Partial<Omit<ChatMessageUI, 'id'>>) => void;
  setThinking: (thinking: boolean) => void;
  clear: () => void;
  removeMessage: (id: string) => void;
}

export const useChatStoreBase = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isThinking: false,

      addMessage: (message) => {
        const id = getSafeUUID();
        const timestamp = Date.now();
        set((state) => ({
          messages: [...state.messages, { ...message, id, timestamp }],
        }));
        return id;
      },

      // Append a streaming token-delta to a live assistant message.
      appendDelta: (id, delta) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content: m.content + delta } : m
          ),
        })),

      // Merge metadata (intent/layersUsed/error) into a message — used to
      // finalize a streamed message once the response completes.
      patchMessage: (id, patch) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        })),

      setThinking: (thinking) => set({ isThinking: thinking }),

      clear: () => set({ messages: [] }),

      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'mybazi-chat',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

/**
 * Convenience hook that returns chat state only after hydration.
 * Use this in components to avoid hydration mismatch warnings.
 */
export function useChatSafe() {
  const messages = useChatStoreBase((state) => state.messages);
  const isThinking = useChatStoreBase((state) => state.isThinking);
  const addMessage = useChatStoreBase((state) => state.addMessage);
  const appendDelta = useChatStoreBase((state) => state.appendDelta);
  const patchMessage = useChatStoreBase((state) => state.patchMessage);
  const setThinking = useChatStoreBase((state) => state.setThinking);
  const clear = useChatStoreBase((state) => state.clear);
  const removeMessage = useChatStoreBase((state) => state.removeMessage);

  return {
    messages,
    isThinking,
    addMessage,
    appendDelta,
    patchMessage,
    setThinking,
    clear,
    removeMessage,
  };
}

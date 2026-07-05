import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessageUI {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: string;
  layersUsed?: {
    natal: boolean;
    dynamic: boolean;
  };
  error?: boolean;
}

interface ChatStore {
  messages: ChatMessageUI[];
  isThinking: boolean;
  addMessage: (message: Omit<ChatMessageUI, 'id' | 'timestamp'>) => void;
  setThinking: (thinking: boolean) => void;
  clear: () => void;
  removeMessage: (id: string) => void;
}

export const useChatStoreBase = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isThinking: false,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
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
  const setThinking = useChatStoreBase((state) => state.setThinking);
  const clear = useChatStoreBase((state) => state.clear);
  const removeMessage = useChatStoreBase((state) => state.removeMessage);

  return {
    messages,
    isThinking,
    addMessage,
    setThinking,
    clear,
    removeMessage,
  };
}

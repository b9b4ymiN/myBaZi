'use client';

import { useEffect, useRef } from 'react';
import { useChatSafe } from '@/lib/stores/chat-store';
import { askTianji } from '@/lib/ai/orchestrator';
import type { Profile } from '@/types/profile';
import type { AiSettings } from '@/types/ai-settings';
import { ChatInput } from './chat-input';
import { SuggestionChips } from './suggestion-chips';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatWindowProps {
  profile: Profile;
  settings: AiSettings;
}

export function ChatWindow({ profile, settings }: ChatWindowProps) {
  const { messages, isThinking, addMessage, setThinking } = useChatSafe();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isThinking) return;

    addMessage({ role: 'user', content: text });
    setThinking(true);

    try {
      const currentYear = new Date().getFullYear();
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const result = await askTianji({
        profile,
        userMessage: text,
        settings,
        history,
        currentYear,
      });

      addMessage({
        role: 'assistant',
        content: result.reply,
        intent: result.intent.intent,
        layersUsed: result.layersUsed,
      });
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      addMessage({
        role: 'assistant',
        content: `เกิดข้อผิดพลาด: ${errorMessage}`,
        error: true,
      });
    } finally {
      setThinking(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-4 space-y-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center space-y-4 mb-8">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-800">
                    <Bot className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </Avatar>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  天机 (เทียนจี)
                </h2>
                <p className="text-muted-foreground">ที่ปรึกษาดวงจีน AI ของคุณ
                </p>
                <p className="text-sm text-muted-foreground">
                  Profile: {profile.name} • {profile.gender === 'male' ? 'ชาย' : 'หญิง'} • เกิด{' '}
                  {new Date(profile.birthDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <SuggestionChips onPick={handleSend} />
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0 border border-purple-200 dark:border-purple-800">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </Avatar>
                  )}
                  <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <Card
                      className={`p-3 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : message.error
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <p className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-foreground'}`}>
                        {message.content}
                      </p>
                    </Card>
                    {message.role === 'assistant' && !message.error && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {message.intent && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            {message.intent}
                          </Badge>
                        )}
                        {message.layersUsed && (
                          <>
                            {message.layersUsed.natal && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                ดวงชะตา
                              </Badge>
                            )}
                            {message.layersUsed.dynamic && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                ดวงชะตาเคลื่อนไหว
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {message.error && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>เกิดข้อผิดพลาด</span>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0 border border-purple-200 dark:border-purple-800">
                      <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </Avatar>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 shrink-0 border border-purple-200 dark:border-purple-800">
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </Avatar>
                  <Card className="p-3 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">กำลังคิด...</span>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Input area */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} disabled={isThinking} />
        </div>
      </div>
    </div>
  );
}

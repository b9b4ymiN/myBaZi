'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatSafe } from '@/lib/stores/chat-store';
import { askTianji, askTianjiStream } from '@/lib/ai/orchestrator';
import type { ChatMessageUI } from '@/lib/stores/chat-store';
import type { Profile } from '@/types/profile';
import { ChatInput } from './chat-input';
import { SuggestionChips } from './suggestion-chips';
import { MarkdownRenderer } from '@/components/ui/markdown';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { AlertCircle, Copy, Check, RefreshCw, Square, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatWindowProps {
  profile: Profile;
}

type ApiHistoryMessage = { role: 'user' | 'assistant'; content: string };

export function ChatWindow({ profile }: ChatWindowProps) {
  const {
    messages,
    isThinking,
    addMessage,
    appendDelta,
    patchMessage,
    setThinking,
    removeMessage,
    clear,
  } = useChatSafe();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  // Avatars: 天机 = ai_bazi brand mark; user = gendered profile mascot
  const aiAvatarSrc = '/assets/brand/ai_bazi.png';
  const userAvatarSrc =
    profile.gender === 'male' ? '/assets/brand/man.png' : '/assets/brand/woman.png';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Core streaming turn. Builds the assistant message token-by-token via the
   * store. On stream failure: keeps partial content if any, otherwise falls
   * back to the non-stream path.
   */
  const runAssistant = async (userText: string, history: ApiHistoryMessage[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const currentYear = new Date().getFullYear();

    let assistantId: string | null = null;
    let gotDelta = false;
    let buffer = '';
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (buffer && assistantId) {
        appendDelta(assistantId, buffer);
        buffer = '';
      }
    };

    const onDelta = (delta: string) => {
      if (!gotDelta) {
        // First token — stop the "thinking" dots and create the live bubble.
        gotDelta = true;
        setThinking(false);
        assistantId = addMessage({ role: 'assistant', content: delta });
        return;
      }
      // Throttle store writes (and localStorage persistence) ~60ms.
      buffer += delta;
      if (!flushTimer) flushTimer = setTimeout(flush, 60);
    };

    try {
      const result = await askTianjiStream(
        { profile, userMessage: userText, history, currentYear },
        { onDelta },
        controller.signal
      );
      flush();
      if (assistantId) {
        patchMessage(assistantId, {
          intent: result.intent.intent,
          layersUsed: result.layersUsed,
        });
      } else {
        // No tokens streamed (empty reply) — record the final reply directly.
        addMessage({
          role: 'assistant',
          content: result.reply || '(ไม่มีคำตอบกลับมา)',
          intent: result.intent.intent,
          layersUsed: result.layersUsed,
        });
      }
    } catch {
      flush();
      const aborted = controller.signal.aborted;
      if (aborted) {
        // User pressed stop — keep whatever streamed so far (no error flag).
        if (assistantId && !buffer && !gotDelta) {
          // nothing streamed at all — drop the empty placeholder if any
        }
      } else if (assistantId) {
        // Mid-stream error — keep partial content, flag softly.
        patchMessage(assistantId, { error: true });
      } else {
        // No content streamed — fall back to non-stream completion.
        try {
          const r = await askTianji({
            profile,
            userMessage: userText,
            history,
            currentYear,
          });
          addMessage({
            role: 'assistant',
            content: r.reply,
            intent: r.intent.intent,
            layersUsed: r.layersUsed,
          });
        } catch (e2) {
          const msg = e2 instanceof Error ? e2.message : 'ไม่ทราบสาเหตุ';
          addMessage({ role: 'assistant', content: `เกิดข้อผิดพลาด: ${msg}`, error: true });
        }
      }
    } finally {
      if (flushTimer) clearTimeout(flushTimer);
      setThinking(false);
      abortRef.current = null;
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isThinking) return;
    // Build history BEFORE adding the new user message (closure is stale,
    // so `messages` correctly excludes the turn we're about to create).
    const history: ApiHistoryMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    addMessage({ role: 'user', content: text });
    setThinking(true);
    await runAssistant(text, history);
  };

  const handleRegenerate = async () => {
    if (isThinking) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    const userMsg = messages[messages.length - 2];
    if (!userMsg || userMsg.role !== 'user') return;
    const history: ApiHistoryMessage[] = messages.slice(0, -2).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    removeMessage(last.id);
    setThinking(true);
    await runAssistant(userMsg.content, history);
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100dvh-11rem)] lg:h-[calc(100dvh-7rem)] min-h-[400px]">
      {/* Header + reset */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Image
            src={aiAvatarSrc}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-contain"
          />
          <span className="font-semibold text-ink">天机 · เทียนจี</span>
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResetOpen(true)}
            aria-label="ล้างการสนทนา"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">ล้าง</span>
          </Button>
        )}
      </header>

      {/* Reset confirm dialog */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ล้างการสนทนาทั้งหมด?</AlertDialogTitle>
            <AlertDialogDescription>
              จะลบข้อความทั้งหมดในเครื่องของคุณ — ไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clear();
                setResetOpen(false);
              }}
            >
              ล้างการสนทนา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages area */}
      <ScrollArea className="min-h-0 flex-1 px-4">
        <div className="max-w-3xl mx-auto py-4 space-y-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center space-y-4 mb-8">
                <div className="flex justify-center mb-4">
                  <Image
                    src={aiAvatarSrc}
                    alt=""
                    aria-hidden="true"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full border-2 border-gold/50 bg-gold/10 object-contain p-1"
                  />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gold to-jade bg-clip-text text-transparent">
                  天机 (เทียนจี)
                </h2>
                <p className="text-muted-foreground">ที่ปรึกษาดวงจีน AI ของคุณ</p>
                <p className="text-sm text-muted-foreground">
                  Profile: {profile.name} • {profile.gender === 'male' ? 'ชาย' : 'หญิง'} • เกิด{' '}
                  {new Date(profile.birthDate).toLocaleDateString('th-TH')}
                </p>
              </div>
              <SuggestionChips onPick={handleSend} />
            </div>
          ) : (
            <>
              {messages.map((message, i) => {
                const isLastAssistant =
                  message.role === 'assistant' &&
                  i === messages.length - 1 &&
                  !isThinking;
                return (
                  <div
                    key={message.id}
                    className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Image
                        src={aiAvatarSrc}
                        alt=""
                        aria-hidden="true"
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-full border border-gold/50 bg-gold/10 object-contain p-0.5"
                      />
                    )}
                    <div
                      className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <Card
                        className={`px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : message.error
                            ? 'bg-destructive/10 border-destructive/30'
                            : 'bg-card border-border'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap text-primary-foreground">
                            {message.content}
                          </p>
                        )}
                      </Card>

                      {/* Meta + actions row */}
                      {message.role === 'assistant' && (
                        <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                          {!message.error && (
                            <>
                              {message.intent && (
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  {message.intent}
                                </Badge>
                              )}
                              {message.layersUsed?.natal && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  ดวงชะตา
                                </Badge>
                              )}
                              {message.layersUsed?.dynamic && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  ดวงชะตาเคลื่อนไหว
                                </Badge>
                              )}
                            </>
                          )}
                          {message.error && (
                            <span className="flex items-center gap-1 text-destructive text-xs">
                              <AlertCircle className="h-3 w-3" />
                              <span>เกิดข้อผิดพลาด</span>
                            </span>
                          )}
                          <MessageActions
                            message={message}
                            isLastAssistant={isLastAssistant}
                            onRegenerate={handleRegenerate}
                          />
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Image
                        src={userAvatarSrc}
                        alt=""
                        aria-hidden="true"
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-full border border-jade/40 bg-jade/10 object-cover"
                      />
                    )}
                  </div>
                );
              })}
              {isThinking && (
                <div className="flex gap-3 justify-start">
                  <Image
                    src={aiAvatarSrc}
                    alt=""
                    aria-hidden="true"
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-full border border-gold/50 bg-gold/10 object-contain p-0.5"
                  />
                  <Card className="px-3 py-2.5 bg-card border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-jade rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-jade rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-jade rounded-full animate-bounce" />
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
          {isThinking ? (
            <Button
              variant="outline"
              onClick={handleStop}
              className="w-full"
              aria-label="หยุดการตอบ"
            >
              <Square className="h-4 w-4" />
              หยุดการตอบ
            </Button>
          ) : (
            <ChatInput onSend={handleSend} disabled={isThinking} />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageActions({
  message,
  isLastAssistant,
  onRegenerate,
}: {
  message: ChatMessageUI;
  isLastAssistant: boolean;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — fail silently
    }
  };

  return (
    <div className="flex gap-1 opacity-100 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        onClick={copy}
        aria-label={copied ? 'คัดลอกแล้ว' : 'คัดลอกคำตอบ'}
      >
        {copied ? <Check className="text-jade" /> : <Copy />}
      </Button>
      {isLastAssistant && !message.error && (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={onRegenerate}
          aria-label="สร้างคำตอบใหม่"
        >
          <RefreshCw />
        </Button>
      )}
    </div>
  );
}

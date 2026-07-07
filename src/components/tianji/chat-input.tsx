'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { MOTION } from '@/components/ui/motion';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [text]);

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/80 p-1.5 backdrop-blur-sm transition-shadow duration-200 focus-within:border-gold/50 focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--gold)_22%,transparent),0_8px_28px_color-mix(in_oklch,var(--gold)_18%,transparent)]">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ถาม天机 anything... (Shift+Enter ขึ้นบรรทัด)"
        className="min-h-[44px] max-h-[200px] resize-none overflow-y-auto border-0 bg-transparent shadow-none focus-visible:ring-0"
        disabled={disabled}
        rows={1}
      />
      <motion.div
        animate={{ scale: hasText && !disabled ? 1 : 0.9 }}
        transition={MOTION.spring.snappy}
        className="shrink-0"
      >
        <Button
          onClick={handleSubmit}
          disabled={!hasText || disabled}
          size="icon"
          className={
            hasText && !disabled
              ? 'h-[44px] w-[44px] bg-gradient-to-br from-gold to-jade shadow-[0_4px_16px_color-mix(in_oklch,var(--jade)_45%,transparent)]'
              : 'h-[44px] w-[44px]'
          }
          aria-label="ส่งข้อความ"
        >
          <Send className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}

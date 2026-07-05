'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const suggestions = [
  'วิเคราะห์ลักษณะนิสัยฉัน',
  'จุดแข็ง-จุดอ่อนดวงฉัน',
  'ปี 2026 เป็นยังไง',
  'เดือนหน้าเหมาะทำอาชีพอะไร',
  'ธาตุประโยชน์ (用神) ของฉันคืออะไร',
];

interface SuggestionChipsProps {
  onPick: (text: string) => void;
}

export function SuggestionChips({ onPick }: SuggestionChipsProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-gold/10 to-jade/10 border-gold/40">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">ลองถาม天机ดู:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => onPick(suggestion)}
              className="text-xs h-8 px-3 border-jade/30 hover:bg-jade/10 hover:text-jade"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}

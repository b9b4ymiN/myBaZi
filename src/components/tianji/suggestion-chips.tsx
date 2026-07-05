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
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-100 dark:border-purple-900">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">ลองถาม天机ดู:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => onPick(suggestion)}
              className="text-xs h-7 px-3 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}

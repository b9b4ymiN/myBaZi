/**
 * InsightNarrative component - แสดง "สิ่งที่คุณอยากรู้" insight flow
 * Render a BaZiNarrative as beautiful, branded, mobile-first card group
 */

"use client";

import type { BaZiNarrative } from "@/lib/bazi/narrative";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  User,
  Sparkles,
  Briefcase,
  Clock,
  Cloud,
  Coins,
  Heart,
  HeartPulse,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightNarrativeProps {
  narrative: BaZiNarrative;
}

/**
 * Element Thai name to element mapping for color utilities
 */
const ELEMENT_COLOR_MAP: Record<string, string> = {
  ไฟ: "element-fire",
 fire: "element-fire",
  ไม้: "element-wood",
 wood: "element-wood",
  ดิน: "element-earth",
 earth: "element-earth",
  โลหะ: "element-metal",
 metal: "element-metal",
  น้ำ: "element-water",
 water: "element-water",
};

/**
 * Section icons mapping — 7 life domains (narrative v2)
 */
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  personality: User,
  career: Briefcase,
  wealth: Coins,
  relationship: Heart,
  health: HeartPulse,
  timing: Clock,
  family: Users,
};

/**
 * InsightNarrative - แสดงความหมายดวงจีนแบบเป็นเรื่องเป็นราว
 */
export function InsightNarrative({ narrative }: InsightNarrativeProps) {
  const {
    dayMasterName,
    elementThai,
    yinYangThai,
    archetypeTitle,
    archetypeMotto,
    opening,
    sections,
    closingNote,
  } = narrative;

  // Get element color class
  const elementColorClass = ELEMENT_COLOR_MAP[elementThai] || "text-foreground";

  return (
    <div className="space-y-6">
      {/* Lead block: archetype + motto + opening */}
      <Card className="border-2 border-jade/20 bg-gradient-to-br from-jade/5 to-transparent">
        <CardContent className="p-6 space-y-4">
          {/* Archetype title + motto */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-ink">{archetypeTitle}</h3>
            <p className="text-muted-foreground italic text-sm">&ldquo;{archetypeMotto}&rdquo;</p>
          </div>

          {/* Opening paragraph */}
          <div className="text-base leading-7">
            <MarkdownRenderer content={opening} />
          </div>

          {/* Day Master badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-sm px-3 py-1", elementColorClass)}>
              {dayMasterName} {elementThai} ({yinYangThai})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 7 life-domain sections (narrative v2) */}
      {sections.map((section) => {
        const IconComponent = SECTION_ICONS[section.id];

        return (
          <Card key={section.id} className="border-border/70 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {IconComponent && (
                  <div className="mt-1">
                    <IconComponent className="h-5 w-5 text-jade" />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Intro text (if present) */}
              {section.intro && (
                <div className="text-sm leading-7">
                  <MarkdownRenderer content={section.intro} />
                </div>
              )}

              {/* Bullets (if present) */}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc space-y-1.5 pl-5 marker:text-jade">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx} className="text-sm pl-1">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Footer callout */}
      <Card className="border-jade/20 bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Cloud className="h-5 w-5 text-jade mt-0.5 shrink-0" />
            <div className="flex-1 text-sm leading-6">
              <p className="text-muted-foreground">{closingNote}</p>
              <p className="mt-2">
                <Link
                  href="/tianji"
                  className="inline-flex items-center gap-1 font-medium text-jade hover:text-jade-deep underline decoration-jade/40 underline-offset-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  ถาม 天机 ได้เลย
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

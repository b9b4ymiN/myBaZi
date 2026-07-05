/**
 * ArchetypeCard component - แสดงลักษณะนิสัยลึกจาก Day Master
 * แสดง traits, strengths, challenges, careers แบบเป็นระเบียบ
 */

"use client";

import type { Archetype } from "@/lib/bazi/archetypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ArchetypeCardProps {
  archetype: Archetype;
  dayMasterName: string;
}

/**
 * แสดงลักษณะนิสัยลึก (Archetype)
 */
export function ArchetypeCard({ archetype, dayMasterName }: ArchetypeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ลักษณะนิสัยลึก - {dayMasterName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title + Motto */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{archetype.title}</h3>
          <p className="text-muted-foreground italic">&ldquo;{archetype.motto}&rdquo;</p>
        </div>

        <Separator />

        {/* Traits */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            ลักษณะนิสัย
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {archetype.traits.map((trait, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-sm">{trait}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            จุดแข็ง
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {archetype.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            จุดท้าทาย
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {archetype.challenges.map((challenge, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">!</span>
                <span className="text-sm">{challenge}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Careers */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            อาชีพที่เหมาะสม
          </h4>
          <div className="flex flex-wrap gap-2">
            {archetype.careers.map((career, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {career}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Pair Picker - เลือกคู่ดวงเพื่อเทียบความเข้ากัน
 * "use client" component สำหรับเลือก self และ relative profiles
 */

"use client";

import { Profile } from "@/types/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { relationshipLabel } from "@/lib/bazi/relationship-labels";
import { cn } from "@/lib/utils";

interface PairPickerProps {
  profiles: Profile[];
  selfId: string;
  relativeId: string;
  onSelfChange: (id: string) => void;
  onRelativeChange: (id: string) => void;
}

export function PairPicker({
  profiles,
  selfId,
  relativeId,
  onSelfChange,
  onRelativeChange,
}: PairPickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Self picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">ดวงของ</label>
        <Select value={selfId} onValueChange={onSelfChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกดวงของคุณ" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => {
              const isOtherPerson = profile.id === relativeId;
              const disabled = isOtherPerson;

              return (
                <SelectItem
                  key={profile.id}
                  value={profile.id}
                  disabled={disabled}
                  className={cn(disabled && "opacity-50 cursor-not-allowed")}
                >
                  <div className="flex items-center gap-2">
                    <span>{profile.name}</span>
                    {profile.relationship && (
                      <Badge variant="outline" className="text-xs">
                        {relationshipLabel(profile.relationship)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selfId && (
          <p className="text-xs text-muted-foreground">
            {profiles.find((p) => p.id === selfId)?.name || "-"}
          </p>
        )}
      </div>

      {/* Relative picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">เทียบกับ</label>
        <Select value={relativeId} onValueChange={onRelativeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกดวงที่ต้องการเทียบ" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => {
              const isOtherPerson = profile.id === selfId;
              const disabled = isOtherPerson;

              return (
                <SelectItem
                  key={profile.id}
                  value={profile.id}
                  disabled={disabled}
                  className={cn(disabled && "opacity-50 cursor-not-allowed")}
                >
                  <div className="flex items-center gap-2">
                    <span>{profile.name}</span>
                    {profile.relationship && (
                      <Badge variant="outline" className="text-xs">
                        {relationshipLabel(profile.relationship)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {relativeId && (
          <p className="text-xs text-muted-foreground">
            {profiles.find((p) => p.id === relativeId)?.name || "-"}
          </p>
        )}
      </div>
    </div>
  );
}

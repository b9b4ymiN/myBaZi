'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ChatWindow } from '@/components/tianji/chat-window';
import { CelestialBg } from '@/components/tianji/celestial-bg';
import { useProfiles } from '@/lib/stores/use-hydrated';
import { useBaZiAnalysis } from '@/lib/bazi/use-bazi-analysis';
import type { ElementName } from '@/lib/bazi/types';
import { UserCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type AiStatus = 'loading' | 'ok' | 'not-configured';

export default function TianjiPage() {
  const { profiles, activeProfileId } = useProfiles();
  const profile = profiles.find((p) => p.id === activeProfileId) || null;
  const [aiStatus, setAiStatus] = useState<AiStatus>('loading');

  // ดึง Day Master element เพื่อ element-tint orb/atmosphere (天机 รู้จักธาตุเจ้าวันของ user)
  const analysis = useBaZiAnalysis(profile);
  const dayMasterElement: ElementName | null =
    analysis?.chart.dayMaster.element ?? null;

  // เช็คว่า server มี AI env ครบหรือไม่ (ไม่ return key/endpoint)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data: { ok?: boolean }) => {
        if (!cancelled) setAiStatus(data.ok ? 'ok' : 'not-configured');
      })
      .catch(() => {
        if (!cancelled) setAiStatus('not-configured');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // No profile selected
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <Alert variant="default">
              <UserCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>กรุณาเลือกโปรไฟล์ก่อนใช้งาน 天机 AI</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profiles">ไปที่โปรไฟล์</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI not configured on server
  if (aiStatus === 'not-configured') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI ยังไม่พร้อม — ผู้ดูแลยังไม่ได้ตั้งค่าบน server
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading or OK — render chat window (it handles its own loading state)
  return (
    <div className="mx-auto max-w-4xl px-4 pt-4 lg:px-6 lg:pt-6 lg:pb-6">
      <Card className="relative overflow-hidden border-gold/20 bg-card/70 backdrop-blur-sm">
        {/* Celestial atmosphere — อยู่ใน Card (absolute) ลอดผ่าน chat content */}
        <CelestialBg />
        <ChatWindow
          profile={profile}
          profiles={profiles}
          dayMasterElement={dayMasterElement}
        />
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ChatWindow } from '@/components/tianji/chat-window';
import { useActiveProfileSafe, useAiSettingsSafe } from '@/lib/stores/use-hydrated';
import { Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function TianjiPage() {
  const profile = useActiveProfileSafe();
  const { settings } = useAiSettingsSafe();

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

  // AI not configured
  if (!settings || !settings.enabled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <Alert variant="default">
              <Settings className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>กรุณาตั้งค่า AI ก่อนใช้งาน 天机 AI</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">ไปที่ตั้งค่า</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All good - show chat window
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <ChatWindow profile={profile} settings={settings} />
      </Card>
    </div>
  );
}

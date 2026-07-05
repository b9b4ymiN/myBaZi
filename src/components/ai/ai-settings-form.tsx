'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAiSettings } from '@/lib/stores/ai-settings-store';
import { testAiConnection } from '@/lib/ai/test-connection';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

export function AiSettingsForm() {
  const { settings, setSettings } = useAiSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    reply?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testAiConnection(settings);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        ok: false,
        message:
          error instanceof Error ? error.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    // Settings are already persisted via zustand
    setTestResult(null);
  };

  const handleReset = () => {
    setTestResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Security Warning */}
      <Alert variant="destructive">
        <AlertDescription className="text-sm">
          <strong>⚠️ คำเตือนด้านความปลอดภัย:</strong> API key จะถูกเก็บในเบราว์เซอร์ของคุณ (localStorage)
          {' '}
          — ห้ามใช้ในเครื่องสาธารณะ และควรใช้ key ที่จำกัด usage
        </AlertDescription>
      </Alert>

      {/* Enabled Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="ai-enabled">เปิดใช้งาน AI</Label>
          <p className="text-sm text-muted-foreground">
            เปิด/ปิดการใช้งาน 天机 (เทียนจี) AI
          </p>
        </div>
        <Switch
          id="ai-enabled"
          checked={settings.enabled}
          onCheckedChange={(checked) => setSettings({ enabled: checked })}
        />
      </div>

      {/* Endpoint */}
      <div className="space-y-2">
        <Label htmlFor="endpoint">Endpoint URL</Label>
        <Input
          id="endpoint"
          type="url"
          placeholder="https://api.z.ai/api/coding/paas/v4/chat/completions"
          value={settings.endpoint}
          onChange={(e) => {
            setSettings({ endpoint: e.target.value });
            handleReset();
          }}
          disabled={!settings.enabled}
        />
        <p className="text-xs text-muted-foreground">
          OpenAI-compatible endpoint URL (เช่น GLM, Azure OpenAI)
        </p>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={settings.apiKey}
              onChange={(e) => {
                setSettings({ apiKey: e.target.value });
                handleReset();
              }}
              disabled={!settings.enabled}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
              disabled={!settings.enabled}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          API key สำหรับยืนยันตัวตนกับ endpoint
        </p>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label htmlFor="model">Model Name</Label>
        <Input
          id="model"
          type="text"
          placeholder="glm-4.6"
          value={settings.model}
          onChange={(e) => {
            setSettings({ model: e.target.value });
            handleReset();
          }}
          disabled={!settings.enabled}
        />
        <p className="text-xs text-muted-foreground">
          ชื่อ model (เช่น glm-4.6, gpt-4o-mini, claude-3-5-sonnet)
        </p>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Temperature</Label>
          <Badge variant="outline">{settings.temperature.toFixed(1)}</Badge>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.1}
          value={[settings.temperature]}
          onValueChange={([value]) => setSettings({ temperature: value })}
          disabled={!settings.enabled}
          className="flex-1"
        />
        <p className="text-xs text-muted-foreground">
          ความคิดสร้างสรรค์ของ AI (0 = มั่นใจ, 1 = สร้างสรรค์)
        </p>
      </div>

      {/* Test Connection */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={!settings.enabled || isTesting || !settings.endpoint || !settings.apiKey || !settings.model}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังทดสอบ...
            </>
          ) : (
            'ทดสอบการเชื่อมต่อ'
          )}
        </Button>

        {testResult && (
          <Alert variant={testResult.ok ? 'default' : 'destructive'}>
            <div className="flex items-start gap-2">
              {testResult.ok ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <AlertDescription className="font-medium">
                  {testResult.message}
                </AlertDescription>
                {testResult.reply && (
                  <AlertDescription className="text-sm text-muted-foreground">
                    ตอบ: &quot;{testResult.reply}&quot;
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        )}
      </div>

      {/* Save Button */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={!settings.enabled}
        className="w-full"
      >
        บันทึกการตั้งค่า
      </Button>
    </div>
  );
}

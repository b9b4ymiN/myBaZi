import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiSettingsForm } from "@/components/ai/ai-settings-form";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">ตั้งค่า (設定)</CardTitle>
          <CardDescription>การตั้งค่าแอปพลิเคชัน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Settings Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">天机 (เทียนจี) AI Settings</h3>
              <p className="text-sm text-muted-foreground">
                ตั้งค่า OpenAI-compatible endpoint และ API key สำหรับบริการ AI
              </p>
            </div>
            <AiSettingsForm />
          </div>

          {/* Other Settings Placeholder */}
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <h3 className="font-semibold mb-2">การตั้งค่าอื่นๆ</h3>
            <p className="text-sm text-muted-foreground">
              การตั้งค่าเพิ่มเติมจะเปิดใช้งานใน Phase ต่อๆ ไป
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

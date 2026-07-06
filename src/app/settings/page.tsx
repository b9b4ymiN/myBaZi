import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/brand/logo.png"
            alt="myBaZi logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <h1 className="text-2xl font-bold">ตั้งค่า (設定)</h1>
        </div>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">การตั้งค่าแอปพลิเคชัน</CardTitle>
          <CardDescription>ตั้งค่า myBaZi ตามความต้องการของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI config ย้ายไปฝั่ง server (.env / Vercel) แล้ว — ไม่มีใน UI */}

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

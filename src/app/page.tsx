"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfiles, useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import { QIMEN_ENABLED } from "@/config/nav";
import { HomeHub } from "@/components/home/home-hub";

export default function Home() {
  const { isHydrated } = useProfiles();
  const activeProfile = useActiveProfileSafe();

  // Skeleton during hydration or while computing active profile
  if (!isHydrated || (activeProfile === null && isHydrated)) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-28 rounded-3xl bg-[#eadfca]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40 rounded-2xl bg-[#eadfca]" />
            <Skeleton className="h-40 rounded-2xl bg-[#eadfca]" />
            <Skeleton className="h-40 rounded-2xl bg-[#eadfca]" />
          </div>
        </div>
      </main>
    );
  }

  // Hub when user has active profile
  if (activeProfile !== null) {
    return <HomeHub profile={activeProfile} />;
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#fbf5e8] px-4 py-8 text-[#2f2418]">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b979] bg-[#fffaf0] px-3 py-2 text-sm text-[#1f5f54] shadow-sm">
            <Image
              src="/assets/brand/ornament-cloud-divider.png"
              alt=""
              aria-hidden="true"
              width={37}
              height={20}
              className="h-5 w-[37px]"
            />
            PWA ดวงจีนแบบ local-first
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-5xl font-bold leading-tight text-[#1f5f54] sm:text-6xl">
              myBaZi
            </h1>
            <p className="max-w-2xl text-2xl font-semibold leading-relaxed">
              เริ่มต้นด้วยโปรไฟล์แรก เพื่อเปิดแผนผังปาจื้อ ปฏิทินมงคล{QIMEN_ENABLED ? " และฉีเหมือน" : ""} ในแอปเดียว
            </p>
            <p className="max-w-xl text-base leading-7 text-[#6b5a3f]">
              ข้อมูลวันเกิดและโปรไฟล์ถูกเก็บไว้ในเครื่องของคุณเป็นหลัก เหมาะสำหรับใช้งานซ้ำทุกวันแบบ PWA โดยไม่ต้องผ่านหน้า marketing ก่อนเข้าแอป
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-[#2f7a68] px-5 text-base text-[#fffaf0] hover:bg-[#256657]">
              <Link href="/profiles">
                <UserPlus className="mr-2 h-5 w-5" />
                สร้างโปรไฟล์แรก
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 border-[#d6b979] bg-[#fffaf0] px-5 text-base">
              <Link href="/tongshu">
                <CalendarDays className="mr-2 h-5 w-5" />
                ดูปฏิทินมงคล
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e4cf99] bg-[#fffaf0]/90 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-[#2f7a68]" />
              <div className="font-medium">Local-first</div>
              <p className="mt-1 text-sm text-[#6b5a3f]">โปรไฟล์อยู่ใน browser storage ของคุณ</p>
            </div>
            <div className="rounded-2xl border border-[#e4cf99] bg-[#fffaf0]/90 p-4">
              <Sparkles className="mb-3 h-5 w-5 text-[#d2a13e]" />
              <div className="font-medium">Five Elements</div>
              <p className="mt-1 text-sm text-[#6b5a3f]">สีและสัญลักษณ์อิง 木 火 土 金 水</p>
            </div>
            <div className="rounded-2xl border border-[#e4cf99] bg-[#fffaf0]/90 p-4">
              <CalendarDays className="mb-3 h-5 w-5 text-[#0f7590]" />
              <div className="font-medium">Daily PWA</div>
              <p className="mt-1 text-sm text-[#6b5a3f]">เข้าใช้งานเร็วสำหรับดูดวงประจำวัน</p>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden rounded-[2rem] border-[#d6b979] bg-[#fffaf0] shadow-[0_24px_80px_rgba(76,57,25,0.16)]">
          <CardContent className="space-y-5 p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/brand/logo.png"
                  alt=""
                  aria-hidden="true"
                  width={58}
                  height={58}
                  className="h-14 w-14"
                />
                <div>
                  <div className="font-serif text-2xl font-bold text-[#1f5f54]">myBaZi</div>
                  <div className="text-sm text-[#6b5a3f]">first profile setup</div>
                </div>
              </div>
              <Image
                src="/assets/brand/ornament-cloud-divider.png"
                alt=""
                aria-hidden="true"
                width={59}
                height={32}
                className="hidden h-8 w-[59px] sm:block"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                ["ปี", "Y", "โลหะ+ลิง", "/assets/brand/element-metal-pearl.png"],
                ["เดือน", "M", "น้ำ+หนู", "/assets/brand/element-water-wave.png"],
                ["วัน", "D", "ไฟ+ม้า", "/assets/brand/element-fire-flame.png"],
                ["เวลา", "H", "ดิน+สุนัข", "/assets/brand/element-earth-gold.png"],
              ].map(([label, mark, caption, image], index) => (
                <div
                  key={label}
                  className={`min-h-36 rounded-2xl border bg-[#fffdf7] p-3 text-center ${
                    index === 2 ? "border-[#e36d57] ring-2 ring-[#f2a65f]/20" : "border-[#ead8ac]"
                  }`}
                >
                  <div className="text-sm text-[#6b5a3f]">{label}</div>
                  <div className={`py-2 font-serif text-4xl font-bold ${index === 2 ? "text-[#c7372d]" : "text-[#2f2418]"}`}>
                    {mark}
                  </div>
                  <div className="text-xs text-[#6b5a3f]">{caption}</div>
                  <Image src={image} alt="" aria-hidden="true" width={48} height={48} className="mx-auto mt-1 h-12 w-12 object-contain opacity-80" />
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-[#ead8ac] bg-[#fffdf7] p-4">
                <div className="mb-3 font-semibold">สมดุลธาตุ</div>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-full bg-[conic-gradient(#5f9560_0_18%,#d85f4a_18%_50%,#d2a13e_50%_70%,#a8aaa6_70%_85%,#277d8f_85%_100%)]">
                    <div className="absolute inset-5 rounded-full bg-[#fffaf0]" />
                  </div>
                  <div className="space-y-2 text-sm text-[#6b5a3f]">
                    <div>ไฟ 32%</div>
                    <div>ดิน 20%</div>
                    <div>น้ำ 15%</div>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#99cfd2] bg-[#edf8f7] p-4">
                <div className="text-sm font-semibold text-[#154f56]">用神</div>
                <div className="mt-1 text-xl font-semibold text-[#154f56]">ธาตุที่เป็นประโยชน์: น้ำ</div>
                <p className="mt-1 max-w-[14rem] text-sm leading-6 text-[#3e6260]">ช่วยปรับสมดุลชีวิต การสื่อสาร และปัญญา</p>
                <Image
                  src="/assets/brand/element-water-wave.png"
                  alt=""
                  aria-hidden="true"
                  width={112}
                  height={112}
                  className="absolute -bottom-2 right-0 h-28 w-28 object-contain opacity-75"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-[#ead8ac] bg-[#fff8ea] p-4">
              <Image
                src="/assets/brand/mascot-rabbit-tongshu.png"
                alt=""
                aria-hidden="true"
                width={92}
                height={92}
                className="h-20 w-20 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-semibold">ปฏิทินมงคล</div>
                <p className="mt-1 text-sm text-[#6b5a3f]">เลือกวันดีและชั่วโมงเหมาะสมหลังสร้างโปรไฟล์</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

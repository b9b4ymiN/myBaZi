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
import { TodayHero } from "@/components/home/today-hero";
import { AtmosphereFrame } from "@/components/home/atmosphere-frame";
import { PageReveal, Stagger, StaggerItem } from "@/components/ui/motion";

export default function Home() {
  const { isHydrated } = useProfiles();
  const activeProfile = useActiveProfileSafe();

  return (
    <>
      <AtmosphereFrame />
      {!isHydrated ? (
        <HomeSkeleton />
      ) : activeProfile !== null ? (
        <HomeHub profile={activeProfile} />
      ) : (
        <Landing />
      )}
    </>
  );
}

function HomeSkeleton() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-14 w-48" />
            <Skeleton className="h-20 w-full max-w-md" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-80 rounded-[2rem]" />
        </div>
      </div>
    </main>
  );
}

function Landing() {
  return (
    <PageReveal>
      <main className="min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* TodayHero — ไฮไลต์ "วันนี้" (ไม่ส่ง profile → ไม่มี resonance band) */}
          <TodayHero />

          {/* Hero + sample */}
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-card/80 px-3 py-1.5 text-sm text-primary backdrop-blur-sm">
                <Image
                  src="/assets/brand/ornament-cloud-divider.png"
                  alt=""
                  aria-hidden="true"
                  width={37}
                  height={20}
                  className="h-4 w-[33px]"
                />
                PWA ดวงจีนแบบ local-first
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-5xl font-bold leading-tight text-primary sm:text-6xl">
                  myBaZi
                </h1>
                <p className="max-w-2xl text-xl font-semibold leading-relaxed text-foreground">
                  เริ่มต้นด้วยโปรไฟล์แรก เพื่อเปิดแผนผังปาจื้อ ปฏิทินมงคล{QIMEN_ENABLED ? " และฉีเหมือน" : ""} ในแอปเดียว
                </p>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  ข้อมูลวันเกิดและโปรไฟล์ถูกเก็บไว้ในเครื่องของคุณเป็นหลัก เหมาะสำหรับใช้งานซ้ำทุกวันแบบ PWA
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-5 text-base">
                  <Link href="/profiles">
                    <UserPlus className="mr-2 h-5 w-5" />
                    สร้างโปรไฟล์แรก
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 border-gold/50 px-5 text-base">
                  <Link href="/tongshu">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    ดูปฏิทินมงคล
                  </Link>
                </Button>
              </div>

              <Stagger className="grid gap-3 sm:grid-cols-3" gap={0.06}>
                <StaggerItem>
                  <FeatureCard
                    icon={<ShieldCheck className="mb-2 h-5 w-5 text-jade" />}
                    title="Local-first"
                    desc="โปรไฟล์อยู่ใน browser storage ของคุณ"
                  />
                </StaggerItem>
                <StaggerItem>
                  <FeatureCard
                    icon={<Sparkles className="mb-2 h-5 w-5 text-gold" />}
                    title="Five Elements"
                    desc="สีและสัญลักษณ์อิง 木 火 土 金 水"
                  />
                </StaggerItem>
                <StaggerItem>
                  <FeatureCard
                    icon={<CalendarDays className="mb-2 h-5 w-5 text-primary" />}
                    title="Daily PWA"
                    desc="เข้าใช้งานเร็วสำหรับดูดวงประจำวัน"
                  />
                </StaggerItem>
              </Stagger>
            </section>

            <SampleCard />
          </div>
        </div>
      </main>
    </PageReveal>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-gold/30 bg-card/70 p-4 backdrop-blur-sm">
      {icon}
      <div className="font-medium text-foreground">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function SampleCard() {
  const pillars: Array<[string, string, string, string]> = [
    ["ปี", "Y", "โลหะ+ลิง", "/assets/brand/element-metal-pearl.png"],
    ["เดือน", "M", "น้ำ+หนู", "/assets/brand/element-water-wave.png"],
    ["วัน", "D", "ไฟ+ม้า", "/assets/brand/element-fire-flame.png"],
    ["เวลา", "H", "ดิน+สุนัข", "/assets/brand/element-earth-gold.png"],
  ];

  return (
    <Card className="overflow-hidden rounded-[2rem] border-gold/50 bg-card/85 shadow-[0_24px_80px_rgba(76,57,25,0.16)] backdrop-blur-sm dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/brand/logo.png"
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <div>
              <div className="font-serif text-xl font-bold text-primary">myBaZi</div>
              <div className="text-xs text-muted-foreground">ตัวอย่างแผนผังปาจื้อ</div>
            </div>
          </div>
          <Image
            src="/assets/brand/ornament-cloud-divider.png"
            alt=""
            aria-hidden="true"
            width={59}
            height={32}
            className="hidden h-7 w-[52px] sm:block"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {pillars.map(([label, mark, caption, image], index) => (
            <div
              key={label}
              className={
                "min-h-[8.5rem] rounded-2xl border bg-background/60 p-3 text-center " +
                (index === 2 ? "border-gold/60 ring-2 ring-gold/20" : "border-border/60")
              }
            >
              <div className="text-xs text-muted-foreground">{label}</div>
              <div
                className={
                  "py-1.5 font-serif text-3xl font-bold " +
                  (index === 2 ? "text-gold" : "text-foreground")
                }
              >
                {mark}
              </div>
              <div className="text-[11px] leading-tight text-muted-foreground">{caption}</div>
              <Image
                src={image}
                alt=""
                aria-hidden="true"
                width={40}
                height={40}
                className="mx-auto mt-1 h-10 w-10 object-contain opacity-80"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <div className="mb-3 text-sm font-semibold text-foreground">สมดุลธาตุ</div>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full bg-[conic-gradient(#5f9560_0_18%,#d85f4a_18%_50%,#d2a13e_50%_70%,#a8aaa6_70%_85%,#277d8f_85%_100%)]">
                <div className="absolute inset-4 rounded-full bg-card" />
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div>ไฟ 32%</div>
                <div>ดิน 20%</div>
                <div>น้ำ 15%</div>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-jade/30 bg-jade/5 p-4">
            <div className="text-sm font-semibold text-primary">用神</div>
            <div className="mt-1 text-lg font-semibold text-primary">ธาตุที่เป็นประโยชน์: น้ำ</div>
            <p className="mt-1 max-w-[14rem] text-sm leading-6 text-muted-foreground">
              ช่วยปรับสมดุลชีวิต การสื่อสาร และปัญญา
            </p>
            <Image
              src="/assets/brand/element-water-wave.png"
              alt=""
              aria-hidden="true"
              width={96}
              height={96}
              className="absolute -bottom-2 right-0 h-24 w-24 object-contain opacity-70"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-4">
          <Image
            src="/assets/brand/mascot-rabbit-tongshu.png"
            alt=""
            aria-hidden="true"
            width={72}
            height={72}
            className="h-16 w-16 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-semibold text-foreground">ปฏิทินมงคล</div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              เลือกวันดีและชั่วโมงเหมาะสมหลังสร้างโปรไฟล์
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

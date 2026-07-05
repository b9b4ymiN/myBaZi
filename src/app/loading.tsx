import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-[#fbf5e8] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/pwa/app-icon-512.png"
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <div>
              <div className="font-serif text-2xl font-bold text-[#1f5f54]">myBaZi</div>
              <div className="text-sm text-[#6b5a3f]">กำลังเตรียมแผนผัง...</div>
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

        <section className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-44 rounded-2xl bg-[#eadfca]" />
          <Skeleton className="h-44 rounded-2xl bg-[#eadfca]" />
          <Skeleton className="h-44 rounded-2xl bg-[#eadfca]" />
          <Skeleton className="h-44 rounded-2xl bg-[#eadfca]" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Skeleton className="h-64 rounded-3xl bg-[#eadfca]" />
          <Skeleton className="h-64 rounded-3xl bg-[#d5e7e6]" />
        </section>
      </div>
    </main>
  );
}

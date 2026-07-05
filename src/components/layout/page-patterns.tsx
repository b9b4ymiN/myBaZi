import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageFrameProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "default" | "wide" | "narrow";
}

const maxWidthClass = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
};

export function PageFrame({ children, className, maxWidth = "default" }: PageFrameProps) {
  return (
    <div className="px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">
      <div className={cn("mx-auto space-y-7", maxWidthClass[maxWidth], className)}>
        {children}
      </div>
    </div>
  );
}

interface RouteHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  ornament?: boolean;
}

export function RouteHeader({
  title,
  eyebrow,
  description,
  meta,
  actions,
  ornament = true,
}: RouteHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-card/78 p-5 shadow-[0_18px_52px_rgba(76,57,25,0.10)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {ornament && (
            <Image
              src="/assets/brand/ornament-cloud-divider.png"
              alt=""
              aria-hidden="true"
              width={44}
              height={24}
              className="h-6 w-[44px] opacity-80"
            />
          )}
          {eyebrow && (
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              {eyebrow}
            </span>
          )}
          {meta}
        </div>
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PageSection({ title, description, children, className }: PageSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || description) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="text-xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <Image
            src="/assets/brand/ornament-cloud-divider.png"
            alt=""
            aria-hidden="true"
            width={44}
            height={24}
            className="hidden h-6 w-[44px] opacity-50 sm:block"
          />
        </div>
      )}
      {children}
    </section>
  );
}

interface EmptyStatePanelProps {
  title: string;
  description: string;
  children?: ReactNode;
  image?: string;
  imageAlt?: string;
}

export function EmptyStatePanel({
  title,
  description,
  children,
  image = "/assets/brand/mascot-profile.png",
  imageAlt = "",
}: EmptyStatePanelProps) {
  return (
    <Card className="surface-paper mx-auto max-w-2xl rounded-[1.75rem]">
      <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
        <Image
          src={image}
          alt={imageAlt}
          aria-hidden={imageAlt ? undefined : "true"}
          width={116}
          height={116}
          className="h-28 w-28"
        />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

interface LoadingPanelProps {
  title: string;
  description?: string;
}

export function LoadingPanel({ title, description }: LoadingPanelProps) {
  return (
    <Card className="surface-paper mx-auto max-w-3xl rounded-[1.75rem]">
      <CardContent className="space-y-5 p-6">
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
            <h2 className="text-xl font-bold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl bg-muted" />
          <Skeleton className="h-24 rounded-2xl bg-muted" />
        </div>
        <Skeleton className="h-40 rounded-2xl bg-muted" />
      </CardContent>
    </Card>
  );
}

"use client";

/**
 * RichText — renders a plain string with inline concept badges (color + element),
 * using the same keyword tables + CSS as the markdown pipeline. Use this for
 * prose across the app that isn't markdown but mentions colors/elements
 * (e.g. useful-god descriptions, strength summaries, TongShu day meanings).
 *
 * If the string has no concept keyword, it renders as a plain span (no overhead).
 */

import { Fragment } from "react";
import { splitConcepts } from "@/lib/markdown/concepts";
import { cn } from "@/lib/utils";

interface RichTextProps {
  children: string;
  className?: string;
}

export function RichText({ children, className }: RichTextProps) {
  const str = typeof children === "string" ? children : String(children ?? "");
  const parts = splitConcepts(str);
  const hasBadge = parts.length > 1 || parts[0].kind !== "text";

  if (!hasBadge) {
    return <span className={className}>{str}</span>;
  }

  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.kind === "text") return <Fragment key={i}>{p.value}</Fragment>;
        const isColor = p.kind === "color";
        return (
          <span
            key={i}
            className={cn("cb", isColor ? "cb-color" : "cb-element")}
            {...(isColor ? { "data-color": p.key } : { "data-el": p.key })}
          >
            {p.label}
          </span>
        );
      })}
    </span>
  );
}

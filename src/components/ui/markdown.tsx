"use client"

/**
 * MarkdownRenderer — shared renderer for AI/chat markdown.
 *
 * Security: rehype-sanitize (extended default schema) runs in the rehype
 * pipeline BEFORE our React components mount, stripping dangerous nodes/attrs
 * (scripts, event handlers, javascript: URLs). react-markdown also does not
 * render raw HTML by default. We additionally harden link rendering with
 * rel/target in the component layer. Never feed this component untrusted
 * HTML — only markdown text.
 */

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeConceptBadges from "@/lib/markdown/rehype-concept-badges"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Keep className on code/pre/span so language detection + future syntax
// highlighting work, without weakening the rest of the sanitize schema.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "className"],
    span: [...(defaultSchema.attributes?.span ?? []), "className"],
  },
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const preRef = React.useRef<HTMLPreElement>(null)
  const [copied, setCopied] = React.useState(false)

  const onCopy = React.useCallback(async () => {
    const text = preRef.current?.innerText ?? ""
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (e.g. non-secure context) — fail silently
    }
  }, [])

  return (
    <div className="group relative my-3">
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        onClick={onCopy}
        aria-label={copied ? "คัดลอกแล้ว" : "คัดลอกโค้ด"}
        className="absolute right-1.5 top-1.5 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="text-jade" /> : <Copy />}
      </Button>
      <pre
        ref={preRef}
        className="overflow-x-auto rounded-xl border border-border/70 bg-muted/60 p-3 pr-9 text-[0.8rem] leading-relaxed"
      >
        {children}
      </pre>
    </div>
  )
}

export type MarkdownRendererProps = {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "text-sm leading-7 text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeConceptBadges]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-5 mb-2 font-heading text-xl font-semibold tracking-tight text-ink">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 font-heading text-lg font-semibold tracking-tight text-ink">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-1.5 font-heading text-base font-semibold text-ink">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 mb-1 font-heading text-sm font-semibold text-ink">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="my-2.5">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2.5 list-disc space-y-1 pl-5 marker:text-jade">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal space-y-1 pl-5 marker:text-jade marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => (
            <div
              role="separator"
              aria-orientation="horizontal"
              className="my-4 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
            />
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-jade/50 bg-jade/5 py-1 pl-3 text-foreground/80 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-jade underline decoration-jade/40 underline-offset-2 hover:decoration-jade"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-[0.8rem]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/70 text-ink">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-border/70 px-2.5 py-1.5 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border/70 px-2.5 py-1.5 align-top">
              {children}
            </td>
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({ className: codeClassName, children }) => {
            const text = String(children ?? "")
            const isInline = !codeClassName && !text.includes("\n")
            if (isInline) {
              return (
                <code className="rounded-md border border-border/60 bg-muted/70 px-1.5 py-0.5 font-mono text-[0.8rem] text-ink">
                  {children}
                </code>
              )
            }
            return (
              <code className={cn("font-mono", codeClassName)}>{children}</code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

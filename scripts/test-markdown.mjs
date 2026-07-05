// Smoke test for MarkdownRenderer: proves formatting renders AND sanitize blocks XSS.
// Run: pnpm tsx scripts/test-markdown.mjs   (tsx is a devDependency)
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MarkdownRenderer } from "../src/components/ui/markdown.tsx"

const sample = [
  "# หัวข้อใหญ่",
  "",
  "**หนา** และ *เอียง* และ `inline code`",
  "",
  "- รายการ 1",
  "- รายการ 2",
  "",
  "1. ลำดับ A",
  "2. ลำดับ B",
  "",
  "```js",
  'console.log("hi")',
  "```",
  "",
  "| ธาตุ | % |",
  "|------|---|",
  "| ไฟ | 30 |",
  "| น้ำ | 40 |",
  "",
  "<script>alert('xss-script')</script>",
  "",
  "[ลิงก์ร้าย](javascript:alert(1))",
  "",
  "[ลิงก์ดี](https://example.com)",
].join("\n")

const html = renderToStaticMarkup(h(MarkdownRenderer, { content: sample }))

const checks = {
  h1: /<h1/.test(html),
  strong: /<strong/.test(html),
  em: /<em/.test(html),
  inlineCode: /<code[^>]*>inline code<\/code>/.test(html),
  ul: /<ul/.test(html),
  ol: /<ol/.test(html),
  pre: /<pre/.test(html),
  table: /<table/.test(html),
  goodLink: /href="https:\/\/example\.com"/.test(html),
  // Security DOD — must all be true (sanitized away):
  noScriptTag: !/<script/i.test(html),
  noJsUrl: !/javascript:alert/i.test(html),
  noOnsiteRawHtml: !/onerror/i.test(html),
}

console.log("MarkdownRenderer smoke:")
for (const [k, v] of Object.entries(checks)) {
  console.log(`  ${v ? "✓" : "✗"} ${k}`)
}
const pass = Object.values(checks).every(Boolean)
console.log(pass ? "\nPASS" : "\nFAIL")
process.exit(pass ? 0 : 1)

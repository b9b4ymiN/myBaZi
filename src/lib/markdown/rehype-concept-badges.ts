/**
 * rehypeConceptBadges — enriches markdown text by wrapping color and element
 * keywords in styled inline badges (`.cb .cb-color[data-color]` /
 * `.cb .cb-element[data-el]`), styled via globals.css.
 *
 * Runs AFTER rehype-sanitize in the pipeline, so the spans it adds are trusted
 * and not stripped. Skips <code>/<pre>. Keyword tables + splitting are shared
 * with <RichText> via `./concepts.ts`.
 */

import { splitConcepts, type ConceptPart } from "./concepts";

// Minimal HAST typing (avoid pulling @types/hast for a plugin this small).
// Loose `any` is deliberate here; the plugin only reads a few well-known fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;

function partToHast(p: ConceptPart): Node {
  if (p.kind === "text") return { type: "text", value: p.value };
  const className = p.kind === "color" ? ["cb", "cb-color"] : ["cb", "cb-element"];
  const dataProp = p.kind === "color" ? { dataColor: p.key } : { dataEl: p.key };
  return {
    type: "element",
    tagName: "span",
    properties: { className, ...dataProp },
    children: [{ type: "text", value: p.label }],
  };
}

function transformText(value: string): Node[] {
  return splitConcepts(value).map(partToHast);
}

const SKIP_TAGS = new Set(["code", "pre", "kbd", "samp"]);

function walk(node: Node): Node[] | undefined {
  if (node.type === "text") {
    return transformText(node.value);
  }
  if (node.type === "element" && SKIP_TAGS.has(node.tagName)) {
    return undefined; // don't transform inside code/pre
  }
  if (node.children) {
    const next: Node[] = [];
    for (const child of node.children) {
      const replaced = walk(child);
      if (replaced) next.push(...replaced);
      else next.push(child);
    }
    node.children = next;
  }
  return undefined;
}

export default function rehypeConceptBadges() {
  return (tree: Node) => {
    walk(tree);
  };
}

/**
 * Concept tables + splitter shared by:
 *   - rehype-concept-badges (markdown pipeline → HAST spans)
 *   - <RichText> (plain JSX strings → React spans)
 *
 * Keeps the two paths DRY: same keyword tables, same splitting logic, same
 * CSS classes (`.cb cb-color[data-color=…]` / `.cb cb-element[data-el=…]`).
 *
 * Only matches unambiguous prefixed forms (สีX / ธาตุX) to avoid flagging
 * common words like น้ำ/ไฟ.
 */

export const COLOR_KEY: Record<string, string> = {
  ขาว: "white", ดำ: "black", แดง: "red", เขียว: "green", น้ำเงิน: "indigo",
  ฟ้า: "sky", เหลือง: "yellow", ทอง: "gold", ชมพู: "pink", ส้ม: "orange",
  ม่วง: "purple", น้ำตาล: "brown", เทา: "gray",
};

export const ELEMENT_KEY: Record<string, string> = {
  ไม้: "wood", ไฟ: "fire", ดิน: "earth", โลหะ: "metal", น้ำ: "water",
};

export const COLOR_RE = /สี(ขาว|ดำ|แดง|เขียว|น้ำเงิน|ฟ้า|เหลือง|ทอง|ชมพู|ส้ม|ม่วง|น้ำตาล|เทา)/g;
export const ELEMENT_RE = /ธาตุ(ไม้|ไฟ|ดิน|โลหะ|น้ำ)/g;

export type ConceptPart =
  | { kind: "text"; value: string }
  | { kind: "color"; key: string; label: string }
  | { kind: "element"; key: string; label: string };

interface Match {
  start: number;
  end: number;
  part: Extract<ConceptPart, { kind: "color" | "element" }>;
}

/**
 * Split a string into a sequence of plain-text and concept-badge parts.
 * Concept matches are sorted by position; overlaps resolved by skipping.
 */
export function splitConcepts(value: string): ConceptPart[] {
  const matches: Match[] = [];
  for (const m of value.matchAll(COLOR_RE)) {
    matches.push({
      start: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
      part: { kind: "color", key: COLOR_KEY[m[1]], label: m[0] },
    });
  }
  for (const m of value.matchAll(ELEMENT_RE)) {
    matches.push({
      start: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
      part: { kind: "element", key: ELEMENT_KEY[m[1]], label: m[0] },
    });
  }
  if (matches.length === 0) return [{ kind: "text", value }];

  matches.sort((a, b) => a.start - b.start);
  const out: ConceptPart[] = [];
  let cursor = 0;
  for (const mt of matches) {
    if (mt.start < cursor) continue; // overlap; skip
    if (mt.start > cursor) out.push({ kind: "text", value: value.slice(cursor, mt.start) });
    out.push(mt.part);
    cursor = mt.end;
  }
  if (cursor < value.length) out.push({ kind: "text", value: value.slice(cursor) });
  return out;
}

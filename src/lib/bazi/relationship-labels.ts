import type { RelationshipRole } from "@/types/profile";

/**
 * Thai labels for relationship roles
 */
export const RELATIONSHIP_ROLE_LABELS: Record<RelationshipRole, string> = {
  self: "ตัวเอง",
  spouse: "คู่ครอง",
  father: "พ่อ",
  mother: "แม่",
  son: "ลูกชาย",
  daughter: "ลูกสาว",
  sibling: "พี่น้อง",
  friend: "เพื่อน",
  other: "อื่นๆ",
};

/**
 * Return Thai label for a relationship role, or "—" if relationship is undefined.
 */
export function relationshipLabel(role: RelationshipRole | undefined): string {
  if (!role) {
    return "—";
  }
  return RELATIONSHIP_ROLE_LABELS[role];
}
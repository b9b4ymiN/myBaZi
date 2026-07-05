/**
 * Relationship Application (用神 relationship) — ความหมายเมื่อ relationship นั้นเป็น 用神
 *
 * 子平 principle: 用神 = ธาตุที่ดวง "ต้องการ" เพื่อสมดุล
 *   ดวงอ่อน → มัก 用神 = resource (印) หรือ companion (比) เพื่อ "เสริม"
 *   ดวงเด่น → มัก 用神 = output/wealth/power (食伤/财/官) เพื่อ "ระบาย/ใช้"
 */

import type { RelationshipType } from "../../../types/bazi-useful-god";
import type { RelationshipApplication } from "./types";

export const RELATIONSHIP_APPLICATION: Record<
  RelationshipType,
  RelationshipApplication
> = {
  resource: {
    relationship: "resource",
    asUsefulGod:
      "ดวงต้องการความรู้ อุปถัมภ์ และคนค้ำยัน (มารดา/ครู/ผู้ใหญ่) — จุดเด่นคือมีผู้สนับสนุนคอยหนุนหลัง",
    timingNote:
      "จังหวะที่ธาตุ resource เข้า (luck/annual) มักมีคนช่วยเหลือ ได้เรียนรู้ มีคุ้มครอง",
  },
  companion: {
    relationship: "companion",
    asUsefulGod:
      "ดวงต้องการเพื่อนพี่น้องและเครือข่ายเสริมกำลัง — จุดเด่นคือทำงานเป็นทีมและหนุนหลังกันได้",
    timingNote:
      "จังหวะที่ธาตุ companion เข้า มักมีเพื่อน/พี่น้อง/หุ้นส่วนดี สังคมเปิด",
  },
  output: {
    relationship: "output",
    asUsefulGod:
      "ดวงต้องระบายพลังผ่านความคิดสร้างสรรค์และการแสดงออก — จุดเด่นคือปัญญาและผลงาน",
    timingNote:
      "จังหวะที่ธาตุ output เข้า มักได้โชว์ความสามารถ สร้างชื่อ มีลูก/ศิษย์/ผลงาน",
  },
  wealth: {
    relationship: "wealth",
    asUsefulGod:
      "ดวงควบคุมทรัพย์และเป้าหมายได้ดี — จุดเด่นคือหาเงิน ธุรกิจ และความสัมพันธ์ที่เป็นมั่นคง",
    timingNote:
      "จังหวะที่ธาตุ wealth เข้า มักมีโอกาสทรัพย์ ค้าขายดี เจอคู่/โอกาส",
  },
  power: {
    relationship: "power",
    asUsefulGod:
      "ดวงรับมืออำนาจ ตำแหน่ง และระเบียบได้ — จุดเด่นคือการเป็นผู้นำ ราชการ องค์กร",
    timingNote:
      "จังหวะที่ธาตุ power เข้า มักได้ตำแหน่ง โอกาสเลื่อนชั้น มีเจ้านาย/ผู้ใหญ่สนับสนุน",
  },
};

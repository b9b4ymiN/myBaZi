"use client";

/**
 * OracleCards — ทางเลือกคำถามแนะนำ สำหรับ empty state ของ天机
 * แทน suggestion-chips เดิม — เป็น "ไพ่ทำนาย" ที่ enter แบบ Stagger
 * + lift/tap micro-interaction
 *
 * แต่ละ card = icon จีน + label ไทยสั้น; กด → ส่ง prompt เต็มเข้า chat
 */

import { motion } from "motion/react";
import { Stagger, StaggerItem, MOTION } from "@/components/ui/motion";

interface OracleCard {
  /** อักษรจีน 1 ตัว แทนหมวด */
  icon: string;
  label: string;
  prompt: string;
}

const CARDS: OracleCard[] = [
  { icon: "元", label: "ลักษณะนิสัย", prompt: "วิเคราะห์ลักษณะนิสัยของฉันจากดวง" },
  { icon: "神", label: "จุดแข็ง-อ่อน", prompt: "จุดแข็งและจุดอ่อนของดวงฉัน" },
  { icon: "用", label: "ธาตุประโยชน์", prompt: "ธาตุประโยชน์ (用神) ของฉันคืออะไร เหมาะทำอะไร" },
  { icon: "年", label: "ปีนี้ 2026", prompt: "ปี 2026 เป็นปีแบบไหนสำหรับฉัน" },
  { icon: "缘", label: "ความรัก", prompt: "ความรักและคู่ครองของฉันเป็นยังไง" },
  { icon: "财", label: "การเงิน-อาชีพ", prompt: "เดือนหน้าเหมาะกับการทำอาชีพหรือลงทุนแบบไหน" },
];

export function OracleCards({ onPick }: { onPick: (text: string) => void }) {
  return (
    <Stagger className="grid grid-cols-2 gap-2.5" gap={0.07}>
      {CARDS.map((c) => (
        <StaggerItem key={c.label}>
          <motion.button
            type="button"
            onClick={() => onPick(c.prompt)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={MOTION.spring.snappy}
            className="group flex w-full items-center gap-2.5 rounded-xl border border-gold/30 bg-card/70 p-3 text-left backdrop-blur-sm transition-colors hover:border-gold/60 hover:bg-card"
          >
            <span className="font-serif text-2xl font-bold leading-none text-jade transition-colors group-hover:text-gold">
              {c.icon}
            </span>
            <span className="text-sm font-medium leading-tight text-ink transition-colors group-hover:text-jade">
              {c.label}
            </span>
          </motion.button>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

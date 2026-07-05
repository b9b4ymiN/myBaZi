/**
 * Element Asset Helper - mapping ธาตุ → brand asset path
 * สำหรับใช้แสดง watercolor image ของ 5 ธาตุ
 */

import type { ElementName } from "@/lib/bazi/types";

/**
 * Map ธาตุ → path ของ brand asset
 */
const ELEMENT_ASSET_PATHS: Record<ElementName, string> = {
  木: "/assets/brand/element-wood-leaf.png",
  火: "/assets/brand/element-fire-flame.png",
  土: "/assets/brand/element-earth-gold.png",
  金: "/assets/brand/element-metal-pearl.png",
  水: "/assets/brand/element-water-wave.png",
};

/**
 * หา asset path จากชื่อธาตุ
 * @param element - ชื่อธาตุ (木/火/土/金/水)
 * @returns path ของ image asset
 */
export function elementAssetPath(element: ElementName): string {
  return ELEMENT_ASSET_PATHS[element];
}

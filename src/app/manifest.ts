import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "myBaZi — ดวงจีนครบวงจร",
    short_name: "myBaZi",
    description: "PWA ดวงจีนครบวงจรสำหรับปาจื้อ ปฏิทินมงคล ฉีเหมือน และเทียนจี AI",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f7f0df",
    theme_color: "#2f7a68",
    categories: ["lifestyle", "productivity", "utilities"],
    lang: "th",
    icons: [
      {
        src: "/assets/pwa/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/pwa/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/pwa/app-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "ปาจื้อ",
        short_name: "八字",
        description: "เปิดหน้าวิเคราะห์ปาจื้อ",
        url: "/bazi",
        icons: [{ src: "/assets/brand/element-mountain-ink.png", type: "image/png" }],
      },
      {
        name: "ปฏิทินมงคล",
        short_name: "通勝",
        description: "เปิดปฏิทินมงคลรายวัน",
        url: "/tongshu",
        icons: [{ src: "/assets/brand/tool-calendar.png", type: "image/png" }],
      },
      {
        name: "ฉีเหมือน",
        short_name: "奇門",
        description: "เปิดผังฉีเหมือน",
        url: "/qimen",
        icons: [{ src: "/assets/brand/tool-compass-qimen.png", type: "image/png" }],
      },
    ],
  };
}

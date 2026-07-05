"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DAY_OFFICER_THAI,
  YELLOW_BLACK_STAR_THAI,
  CONSTELLATION_28_THAI
} from "@/lib/tongshu/thai-labels";

interface ReferenceLibraryProps {
  selectedDayOfficer?: string;
  selectedYellowBlackStar?: string;
  selectedConstellation28?: string;
}

export function ReferenceLibrary({
  selectedDayOfficer,
  selectedYellowBlackStar,
  selectedConstellation28
}: ReferenceLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">คู่มืออ้างอิง (Reference Library)</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {/* 12 Day Officers */}
          <AccordionItem value="day-officers">
            <AccordionTrigger>12 ประจำวัน (建除十二神)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Object.entries(DAY_OFFICER_THAI).map(([name, info]) => (
                  <div
                    key={name}
                    className={cn(
                      "p-3 rounded-lg border",
                      info.auspicious
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
                      selectedDayOfficer === name && "ring-2 ring-blue-500"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}</span>
                          <Badge
                            variant={info.auspicious ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {info.auspicious ? "มงคล" : "อัปมงคล"}
                          </Badge>
                        </div>
                        <div className="text-sm mt-1">{info.nameTh}</div>
                        <div className="text-xs text-muted-foreground mt-1">{info.meaning}</div>
                      </div>
                      {selectedDayOfficer === name && (
                        <Badge className="bg-blue-500 text-white">วันนี้</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 12 Yellow/Black Stars */}
          <AccordionItem value="yellow-black-stars">
            <AccordionTrigger>12 ดาวเหลือง/ดำ (黄黑道十二星)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Object.entries(YELLOW_BLACK_STAR_THAI).map(([name, info]) => (
                  <div
                    key={name}
                    className={cn(
                      "p-3 rounded-lg border",
                      info.auspicious
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
                      selectedYellowBlackStar === name && "ring-2 ring-blue-500"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}</span>
                          <Badge
                            variant={info.auspicious ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {info.auspicious ? "มงคล" : "อัปมงคล"}
                          </Badge>
                        </div>
                        <div className="text-sm mt-1">{info.nameTh}</div>
                      </div>
                      {selectedYellowBlackStar === name && (
                        <Badge className="bg-blue-500 text-white">วันนี้</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 28 Constellations */}
          <AccordionItem value="constellations">
            <AccordionTrigger>28 ดาวประจำวัน (二十八宿)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {Object.entries(CONSTELLATION_28_THAI).map(([name, info]) => (
                  <div
                    key={name}
                    className={cn(
                      "p-3 rounded-lg border",
                      info.auspicious
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
                      selectedConstellation28 === name && "ring-2 ring-blue-500"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}</span>
                          <Badge
                            variant={info.auspicious ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {info.auspicious ? "มงคล" : "อัปมงคล"}
                          </Badge>
                        </div>
                        <div className="text-sm mt-1">{info.nameTh}</div>
                      </div>
                      {selectedConstellation28 === name && (
                        <Badge className="bg-blue-500 text-white">วันนี้</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

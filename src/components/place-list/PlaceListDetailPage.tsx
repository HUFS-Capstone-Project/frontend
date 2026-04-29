import { ArrowLeft, ChevronDown, MapPin, Search } from "lucide-react";

import { cn } from "@/lib/utils";

import type { PlaceListItemData } from "./place-list-mock-data";
import { PLACE_CATEGORY_TABS, PLACE_LIST_TEXT } from "./place-list-mock-data";

type PlaceListDetailPageProps = {
  place: PlaceListItemData;
  onBack: () => void;
};

function MapMarker({ className }: { className?: string }) {
  return (
    <span className={cn("absolute flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#f47f7b] shadow-sm", className)}>
      <MapPin className="size-4 fill-white text-white" aria-hidden />
    </span>
  );
}

export function PlaceListDetailPage({ place, onBack }: PlaceListDetailPageProps) {
  return (
    <div className="bg-background relative flex min-h-0 flex-1 flex-col overflow-hidden pb-24">
      <section className="relative h-[30rem] shrink-0 overflow-hidden bg-[#eef3f5]">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f3f4f6_0_25%,#ffffff_25%_50%,#edf2f7_50%_75%,#ffffff_75%)] bg-[length:82px_82px]" />
          <div className="absolute left-[-4rem] top-52 h-3 w-[36rem] rotate-[-10deg] rounded-full bg-[#2f5fce]/70" />
          <div className="absolute left-[-5rem] top-40 h-4 w-[34rem] rotate-[28deg] rounded-full bg-[#8cc3d8]/65" />
          <MapMarker className="left-[37%] top-[45%]" />
          <MapMarker className="right-[22%] top-[32%]" />
          <MapMarker className="right-[15%] top-[58%]" />
        </div>

        <div className="relative z-10 bg-[#f47f7b] px-4 pb-4 pt-9 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-5 fill-white" aria-hidden />
            <span>{PLACE_LIST_TEXT.detailMapTitle}</span>
          </div>
        </div>

        <div className="relative z-10 px-4 pt-3">
          <div className="flex h-10 items-center gap-3 rounded-full bg-white px-4 shadow-sm">
            <span className="flex-1 text-sm text-[#6b7280]">{PLACE_LIST_TEXT.searchPlaceholder}</span>
            <Search className="size-5 text-[#4b5563]" aria-hidden />
          </div>
          <div className="mt-3 flex gap-2 overflow-hidden">
            {PLACE_CATEGORY_TABS.filter((tab) => tab.id !== "all").map((tab) => (
              <span key={tab.id} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563] shadow-sm">
                {tab.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-28 rounded-t-[28px] bg-white px-4 pb-8 pt-4 shadow-[0_-12px_35px_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-[#d4d4d4]" />
        <button type="button" onClick={onBack} className="touch-target-min mb-3 flex items-center gap-2 text-[#111111]" aria-label="목록으로 돌아가기">
          <ArrowLeft className="size-4" aria-hidden />
          <span className="text-lg font-bold">{place.name}</span>
        </button>

        <p className="text-xs text-[#777777]">{place.address}</p>
        <button type="button" className="mt-4 h-8 w-full rounded-full border border-[#cfcfcf] text-xs font-medium text-[#4d4d4d]">
          {PLACE_LIST_TEXT.reelsButton}
        </button>

        <div className="mt-5 space-y-2 text-sm text-[#111111]">
          <p>{place.openingStatus}</p>
          <p className="text-[#777777]">{place.openingNote}</p>
          <button type="button" className="flex items-center gap-1 font-medium">
            <span>{place.hours}</span>
            <ChevronDown className="size-4" aria-hidden />
          </button>
        </div>
      </section>
    </div>
  );
}
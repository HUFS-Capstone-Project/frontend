import { ArrowLeft, ChevronDown, MapPin } from "lucide-react";

import type { SavedPlace } from "./mypage-mock-data";

type SavedPlaceDetailPageProps = {
  place: SavedPlace;
  onBack: () => void;
};

function getCategoryLabel(category: SavedPlace["category"]) {
  const labels: Record<SavedPlace["category"], string> = {
    food: "??",
    cafe: "??",
    activity: "???",
    etc: "??",
  };

  return labels[category];
}

export function SavedPlaceDetailPage({ place, onBack }: SavedPlaceDetailPageProps) {
  return (
    <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-28">
      <section className="relative h-[27rem] overflow-hidden bg-[#eef3f5]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#eef1ec_0_25%,#ffffff_25%_50%,#e8f0f4_50%_75%,#ffffff_75%)] bg-[length:82px_82px]" />
        <div className="absolute left-[-3rem] top-60 h-3 w-[32rem] rotate-[-9deg] rounded-full bg-[#2454b7]/75" />
        <div className="absolute left-[-4rem] top-72 h-3 w-[34rem] rotate-[24deg] rounded-full bg-[#78bed2]/55" />
        <span className="absolute left-[42%] top-44 flex size-8 items-center justify-center rounded-full border border-[#ef7773] bg-white text-[#ef7773] shadow-sm">
          <MapPin className="size-5 fill-current" aria-hidden />
        </span>

        <div className="relative z-10 bg-[#ef7773] px-5 pb-4 pt-[max(2rem,env(safe-area-inset-top))] text-white">
          <div className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="size-5 fill-white" aria-hidden />
            <span>??? ??</span>
          </div>
        </div>
      </section>

      <section className="relative -mt-20 rounded-t-[1.75rem] bg-white px-5 pb-8 pt-4 shadow-[0_-12px_24px_rgb(0_0_0_/_0.06)]">
        <div className="mx-auto mb-5 h-1 w-14 rounded-full bg-[#d4d4d4]" />

        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="touch-target-min -ml-2 flex items-center justify-center rounded-full">
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">?? ??? ????</span>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-[#111111]">{place.name}</h1>
        </div>

        <p className="mt-3 text-xs font-medium text-[#777777]">{place.address}</p>

        <button
          type="button"
          className="mt-4 flex h-8 w-full items-center justify-center rounded-full border border-[#d8d8d8] bg-white text-xs font-semibold text-[#333333] active:bg-[#f7f7f7]"
        >
          ?? ?? ?? ????
        </button>

        <dl className="mt-5 space-y-3 text-xs text-[#333333]">
          <div>
            <dt className="font-semibold">?? ?</dt>
            <dd className="mt-1 text-[#777777]">10:40 ??</dd>
          </div>
          <div>
            <dt className="font-semibold">??? ?? ??</dt>
            <dd className="mt-1 flex items-center gap-1 text-[#111111]">
              <span>?(4/11) 10:40 ~ 19:30</span>
              <ChevronDown className="size-3" aria-hidden />
            </dd>
          </div>
          <div>
            <dt className="font-semibold">??</dt>
            <dd className="mt-1 text-[#777777]">{getCategoryLabel(place.category)}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

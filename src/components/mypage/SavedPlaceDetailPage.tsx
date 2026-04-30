import { ArrowLeft, ChevronDown, ExternalLink, MapPin } from "lucide-react";

import type { SavedPlace } from "./mypage-mock-data";

const TEXT = {
  mapTitle: "\uB098\uB9CC\uC758 \uC9C0\uB3C4",
  backToPlaces: "\uB098\uC758 \uC7A5\uC18C\uB85C \uB3CC\uC544\uAC00\uAE30",
  reelsButton: "\uB0B4\uAC00 \uBD24\uB358 \uB9B4\uC2A4 \uB2E4\uC2DC\uBCF4\uAE30",
  openedAt: "\uC601\uC5C5 \uC804 10:40 \uC624\uD508",
  sharedBy: "\uACF5\uC720\uB41C \uC7A5\uC18C \uC601\uC5C5",
  todayHours: "\uD1A0(4/11) 10:40 ~ 19:30",
  category: "\uC885\uB958",
} as const;

function getCategoryLabel(category: SavedPlace["category"]) {
  const labels: Record<SavedPlace["category"], string> = {
    food: "\uB9DB\uC9D1",
    cafe: "\uCE74\uD398",
    activity: "\uB180\uAC70\uB9AC",
    etc: "\uAE30\uD0C0",
  };

  return labels[category];
}

type SavedPlaceDetailPageProps = {
  place: SavedPlace;
  onBack: () => void;
};

export function SavedPlaceDetailPage({ place, onBack }: SavedPlaceDetailPageProps) {
  return (
    <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-28">
      <section className="relative min-h-[calc(100dvh-5.5rem)] overflow-hidden bg-white">
        <div className="relative h-[29rem] overflow-hidden bg-[#eef3f5]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#eef1ec_0_25%,#ffffff_25%_50%,#e8f0f4_50%_75%,#ffffff_75%)] bg-[length:82px_82px]" />
          <div className="absolute top-72 left-[-4rem] h-3 w-[34rem] rotate-[-9deg] rounded-full bg-[#2454b7]/75" />
          <div className="absolute top-64 left-[-5rem] h-3 w-[36rem] rotate-[24deg] rounded-full bg-[#78bed2]/55" />
          <div className="absolute top-60 left-10 h-12 w-20 rounded-full bg-[#f7d9a3]/45 blur-sm" />
          <div className="absolute top-32 right-2 h-20 w-24 rounded-full bg-[#d7eadb]/65 blur-sm" />

          {["left-[22%] top-[48%]", "left-[50%] top-[35%]", "right-[18%] top-[54%]"].map(
            (position) => (
              <span
                key={position}
                className={`absolute ${position} flex size-8 items-center justify-center rounded-full border border-[#ef7773] bg-white text-[#ef7773] shadow-sm`}
              >
                <MapPin className="size-5 fill-current" aria-hidden />
              </span>
            ),
          )}

          <div className="relative z-10 bg-[#ef7773] px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-4 text-white">
            <div className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="size-5 fill-white" aria-hidden />
              <span>{TEXT.mapTitle}</span>
            </div>
          </div>
        </div>

        <section className="relative -mt-24 rounded-t-[1.75rem] bg-white px-5 pt-4 pb-8 shadow-[0_-12px_24px_rgb(0_0_0_/_0.06)]">
          <div className="mx-auto mb-5 h-1 w-14 rounded-full bg-[#d4d4d4]" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="touch-target-min -ml-2 flex items-center justify-center rounded-full"
            >
              <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
              <span className="sr-only">{TEXT.backToPlaces}</span>
            </button>
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-[#111111]">
              {place.name}
            </h1>
          </div>

          <p className="mt-2 text-xs leading-relaxed font-medium text-[#777777]">{place.address}</p>

          <button
            type="button"
            className="mt-4 flex h-8 w-full items-center justify-center gap-1 rounded-full border border-[#d8d8d8] bg-white text-xs font-semibold text-[#333333] active:bg-[#f7f7f7]"
          >
            <span>{TEXT.reelsButton}</span>
            <ExternalLink className="size-3" aria-hidden />
          </button>

          <dl className="mt-5 space-y-3 text-xs text-[#333333]">
            <div>
              <dt className="font-semibold">{TEXT.openedAt}</dt>
              <dd className="mt-1 text-[#777777]">{TEXT.sharedBy}</dd>
            </div>
            <div>
              <dt className="sr-only">\uC624\uB298 \uC601\uC5C5\uC2DC\uAC04</dt>
              <dd className="mt-1 flex items-center gap-1 font-semibold text-[#111111]">
                <span>{TEXT.todayHours}</span>
                <ChevronDown className="size-3" aria-hidden />
              </dd>
            </div>
            <div>
              <dt className="sr-only">{TEXT.category}</dt>
              <dd className="inline-flex rounded-full bg-[#f8eeee] px-2 py-1 text-[0.68rem] font-semibold text-[#ef7773]">
                {getCategoryLabel(place.category)}
              </dd>
            </div>
          </dl>
        </section>
      </section>
    </main>
  );
}

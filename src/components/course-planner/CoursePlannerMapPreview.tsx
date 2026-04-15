import { MapPin, Search } from "lucide-react";

const categoryLabels = ["맛집", "카페", "놀거리", "기타"];

type CoursePlannerMapPreviewProps = {
  statusMessage?: string;
  onMapClick?: () => void;
};

export function CoursePlannerMapPreview({ statusMessage, onMapClick }: CoursePlannerMapPreviewProps) {
  return (
    <section className="relative h-[320px] overflow-hidden bg-[#eef3f5]">
      <button
        type="button"
        onClick={onMapClick}
        className="absolute inset-0 cursor-default text-left"
        aria-label="지도 영역"
      >
        <span className="absolute inset-0 bg-[#edf3f1]" />
        <span className="absolute -left-16 top-8 h-28 w-80 rotate-[-18deg] rounded-full bg-[#dbeed6] blur-[1px]" />
        <span className="absolute -right-10 bottom-8 h-32 w-72 rotate-[16deg] rounded-full bg-[#dbeaf7] blur-[1px]" />
        <span className="absolute left-[-80px] top-44 h-8 w-[560px] rotate-[-18deg] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(209,213,219,0.8)]" />
        <span className="absolute left-[-70px] top-48 h-2 w-[560px] rotate-[-18deg] rounded-full bg-[#f4d17f]/80" />
        <span className="absolute left-[-40px] top-28 h-7 w-[520px] rotate-[28deg] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(209,213,219,0.8)]" />
        <span className="absolute left-[-30px] top-31 h-1.5 w-[520px] rotate-[28deg] rounded-full bg-[#8cc3d8]/80" />
        <span className="absolute left-10 top-20 h-4 w-[360px] rotate-[-6deg] rounded-full bg-white/90 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]" />
        <span className="absolute left-28 top-24 text-[0.68rem] font-semibold text-[#8a8f98]">이문1동</span>
        <span className="absolute right-20 top-28 text-[0.68rem] font-semibold text-[#8a8f98]">외대앞역</span>
        <span className="absolute left-36 bottom-20 text-[0.68rem] font-semibold text-[#8a8f98]">회기동</span>
        <span className="absolute left-[7.2rem] top-[8.7rem] h-0.5 w-[9.4rem] rotate-[-34deg] origin-left bg-[#ef746f] shadow-[0_0_0_2px_rgba(255,255,255,0.7)]" />
        <span className="absolute left-[12.6rem] top-[5.45rem] h-0.5 w-[7rem] rotate-[48deg] origin-left bg-[#ef746f] shadow-[0_0_0_2px_rgba(255,255,255,0.7)]" />
        <MapMarker className="left-[6.6rem] top-[8.1rem]" label="1" />
        <MapMarker className="left-[12.1rem] top-[4.7rem]" label="2" />
        <MapMarker className="left-[15.3rem] top-[9.9rem]" label="3" />
        <span className="absolute bottom-14 right-5 flex size-9 items-center justify-center rounded-full bg-white/95 text-xs font-bold text-[#6b7280] shadow-md">
          ◎
        </span>
      </button>

      {statusMessage ? (
        <div className="absolute left-4 right-4 top-6 z-20 rounded-sm bg-[#ef746f] px-4 py-2 text-center text-xs font-semibold text-white shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <div className="relative z-10 bg-[#f47f7b] px-4 pb-3 pt-8 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="size-5 fill-white" aria-hidden />
          <span>실한 두줄 지도</span>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-3">
        <div className="flex h-10 items-center gap-3 rounded-full bg-white/95 px-4 shadow-[0_8px_22px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <span className="flex-1 text-sm text-[#6b7280]">
            저장해둔 장소를 검색해 보세요
          </span>
          <Search className="size-5 text-[#4b5563]" aria-hidden />
        </div>

        <div className="mt-3 flex gap-2 overflow-hidden">
          {categoryLabels.map((label, index) => (
            <span
              key={label}
              className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#4b5563] shadow-sm backdrop-blur-sm"
            >
              {index === 0 ? "🍴 " : index === 1 ? "☕ " : index === 2 ? "🚩 " : "＋ "}
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

type MapMarkerProps = {
  className: string;
  label: string;
};

function MapMarker({ className, label }: MapMarkerProps) {
  return (
    <span className={`absolute ${className} flex flex-col items-center`} aria-hidden>
      <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#ef746f] text-[0.65rem] font-bold text-white shadow-md">
        {label}
      </span>
      <span className="-mt-1 size-2 rotate-45 bg-[#ef746f] shadow-sm" />
    </span>
  );
}

import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";

type PlaceFlowSearchEmptyRowProps = {
  title?: string;
  hint?: string;
};

/** 장소 검색 결과 없음 시 리스트 `<ul>` 안의 `<li>` 한 줄 패턴 */
export function PlaceFlowSearchEmptyRow({
  title = PLACE_FLOW_COPY.emptySearchTitle,
  hint = PLACE_FLOW_COPY.emptySearchHint,
}: PlaceFlowSearchEmptyRowProps) {
  return (
    <li className="px-1 py-8 text-center">
      <p className="text-foreground text-base font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
    </li>
  );
}

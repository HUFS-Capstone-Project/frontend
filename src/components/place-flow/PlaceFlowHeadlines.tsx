type PlaceFlowHeadlinesProps = {
  /** 링크 추가 등에서만 방 이름 표시 */
  roomName?: string | null;
  title: string;
  subtitle: string;
  /** `aria-labelledby`용 첫 타이틀 id */
  titleId?: string;
};

/**
 * 공유 링크 기준 후보 선택 / 링크 후보 / 장소 검색(edit) 상단 타이틀 블록 — 동일 타이포·간격
 */
export function PlaceFlowHeadlines({
  roomName,
  title,
  subtitle,
  titleId,
}: PlaceFlowHeadlinesProps) {
  return (
    <div className="space-y-1">
      {roomName != null && roomName.trim().length > 0 ? (
        <p className="text-foreground text-xl leading-tight font-bold">{roomName.trim()}</p>
      ) : null}
      <h2 id={titleId} className="text-foreground text-xl leading-tight font-bold">
        {title}
      </h2>
      <p className="text-foreground text-xl leading-tight font-bold">{subtitle}</p>
    </div>
  );
}

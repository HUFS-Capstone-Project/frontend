export type RoomAddDrawerProps = {
  onSelectCreate: () => void;
  onSelectJoin: () => void;
};

export function RoomAddDrawer({ onSelectCreate, onSelectJoin }: RoomAddDrawerProps) {
  return (
    <div className="px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <h2 className="text-foreground text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
        방 추가하기
      </h2>
      <div className="mt-6 space-y-3.5">
        <button
          type="button"
          className="w-full rounded-[1.0rem] border border-zinc-300/95 px-4 py-4 text-left transition-colors hover:bg-zinc-100/60 active:bg-zinc-200/65"
          onClick={onSelectCreate}
        >
          <p className="text-foreground text-[1.0rem] leading-snug font-medium">방 생성 / 초대</p>
          <p className="text-muted-foreground mt-1.5 text-[0.8rem] leading-snug">
            장소를 공유하고 싶은 어디더라 유저를 초대해요
          </p>
        </button>
        <button
          type="button"
          className="w-full rounded-[1.0rem] border border-zinc-300/95 px-4 py-4 text-left transition-colors hover:bg-zinc-100/60 active:bg-zinc-200/65"
          onClick={onSelectJoin}
        >
          <p className="text-foreground text-[1.0rem] leading-snug font-medium">입장코드로 참여</p>
          <p className="text-muted-foreground mt-1.5 text-[0.8rem] leading-snug">
            친구에게 받은 입장코드로 장소를 공유해요
          </p>
        </button>
      </div>
    </div>
  );
}

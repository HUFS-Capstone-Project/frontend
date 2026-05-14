import { ChevronRight } from "lucide-react";

type MyAccountActionsProps = {
  onLogout?: () => void;
  onWithdraw?: () => void;
};

export function MyAccountActions({ onLogout, onWithdraw }: MyAccountActionsProps) {
  return (
    <section className="bg-card border-border/40 mt-4 overflow-hidden rounded-[1.4rem] border shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <button
        type="button"
        onClick={onLogout}
        className="active:bg-muted/50 flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-xs font-medium transition-colors"
      >
        <span className="text-secondary-foreground">로그아웃</span>
        <ChevronRight className="text-muted-foreground/45 size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onWithdraw}
        className="active:bg-muted/50 flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-xs font-medium transition-colors"
      >
        <span className="text-secondary-foreground">회원탈퇴</span>
        <ChevronRight className="text-muted-foreground/45 size-4" aria-hidden />
      </button>
    </section>
  );
}

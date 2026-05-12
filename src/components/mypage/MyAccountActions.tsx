type MyAccountActionsProps = {
  onLogout?: () => void;
  onWithdraw?: () => void;
};

export function MyAccountActions({ onLogout, onWithdraw }: MyAccountActionsProps) {
  return (
    <div className="mt-6 flex justify-center gap-2 pb-4">
      <button
        type="button"
        onClick={onLogout}
        className="border-border bg-card text-secondary-foreground active:bg-muted/50 h-8 rounded-md border px-4 text-xs font-medium transition-colors"
      >
        로그아웃
      </button>
      <button
        type="button"
        onClick={onWithdraw}
        className="border-border bg-card text-secondary-foreground active:bg-muted/50 h-8 rounded-md border px-4 text-xs font-medium transition-colors"
      >
        회원탈퇴
      </button>
    </div>
  );
}

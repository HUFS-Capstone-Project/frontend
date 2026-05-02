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
        className="h-8 rounded-md border border-[#e5e5e5] bg-white px-4 text-xs font-medium text-[#444444] active:bg-[#f7f7f7]"
      >
        로그아웃
      </button>
      <button
        type="button"
        onClick={onWithdraw}
        className="h-8 rounded-md border border-[#e5e5e5] bg-white px-4 text-xs font-medium text-[#444444] active:bg-[#f7f7f7]"
      >
        회원탈퇴
      </button>
    </div>
  );
}

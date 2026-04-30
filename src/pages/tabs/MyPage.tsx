import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";

export default function MyPage() {
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="bg-background min-h-0 flex-1" />
      <BottomNavToast message={toastMessage} placement={toastPlacement} />
      <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
    </div>
  );
}

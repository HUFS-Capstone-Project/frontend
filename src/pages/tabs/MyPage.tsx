import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";

export function MyPage() {
  const { toastMessage, handleSelectBottomNav } = useBottomNavController();

  return (
    <div className="-m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="bg-background min-h-0 flex-1" />
      <BottomNavToast message={toastMessage} />
      <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
    </div>
  );
}

const PROTECTED_MAIN_SHELL_KEY = "protected-main-shell";

function isRoomsMainBranch(pathname: string): boolean {
  return pathname === "/rooms" || pathname.startsWith("/rooms/");
}

function isPlacesListOrMapBranch(pathname: string): boolean {
  return pathname === "/places" || pathname.startsWith("/places/map");
}

/**
 * 메인 탭·방 컨텍스트 라우트는 동일 레이아웃(Protected → Suspense 등) 안에서 처리한다.
 * 루트 `Outlet`을 location 전체 경로로 keying 하면 해당 쉘이 매 네비마다 리마운트되므로,
 * 브라우저 히스토리 기반 페이지 전환은 하위 Outlet에서만 경로별로 재생한다.
 *
 * `/places/register`, `/places/edit` 등은 탭 브랜치가 아니므로 `pathname` 자체가 키가 된다.
 */
export function getOutletPresenceBranchKey(pathname: string): string {
  if (
    isRoomsMainBranch(pathname) ||
    isPlacesListOrMapBranch(pathname) ||
    pathname === "/courses" ||
    pathname === "/me"
  ) {
    return PROTECTED_MAIN_SHELL_KEY;
  }
  return pathname;
}

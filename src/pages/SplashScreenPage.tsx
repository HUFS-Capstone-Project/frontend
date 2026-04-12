import "./SplashScreenPage.css";

import { SplashMarkerIcon } from "@/components/ui/SplashMarkerIcon";

const SPLASH_PAGE_ROOT_CLASS_NAME =
  "-m-page splash-screen-page relative flex min-h-0 flex-1 flex-col overflow-hidden";

export function SplashScreenPage() {
  return (
    <main className={SPLASH_PAGE_ROOT_CLASS_NAME} aria-label="어디더라 스플래시 화면">
      <div className="splash-screen-page__viewport">
        <div className="splash-screen-page__brand">
          <SplashMarkerIcon className="splash-screen-page__marker" aria-hidden />
          <h1 className="splash-screen-page__title">어디더라</h1>
        </div>
      </div>
    </main>
  );
}

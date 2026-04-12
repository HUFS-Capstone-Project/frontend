import "./SplashScreenPage.css";

const SPLASH_PAGE_ROOT_CLASS_NAME =
  "-m-page splash-screen-page relative flex min-h-0 flex-1 flex-col overflow-hidden";
const MARKER_LOGO_SRC = "/assets/marker-logo.svg";

export function SplashScreenPage() {
  return (
    <main className={SPLASH_PAGE_ROOT_CLASS_NAME} aria-label="어디더라 스플래시 화면">
      <div className="splash-screen-page__viewport">
        <div className="splash-screen-page__brand">
          <div className="splash-screen-page__symbol-motion" aria-hidden>
            <div className="splash-screen-page__symbol">
              <img
                src={MARKER_LOGO_SRC}
                alt=""
                aria-hidden
                className="splash-screen-page__marker"
                decoding="async"
              />
            </div>
          </div>
          <h1 className="splash-screen-page__title">어디더라</h1>
        </div>
      </div>
    </main>
  );
}

import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { OnboardingGate } from "@/app/router/OnboardingGate";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { MapHomePage } from "@/pages/map/MapHomePage";
import { NicknamePage } from "@/pages/onboarding/NicknamePage";
import { TermsAgreementPage } from "@/pages/onboarding/TermsAgreementPage";
import { RoomMainPage } from "@/pages/room/RoomMainPage";
import { RootIndexPage } from "@/pages/RootIndexPage";
import { SplashScreenPage } from "@/pages/SplashScreenPage";
import { CoursePlannerPage } from "@/pages/tabs/CoursePlannerPage";
import { MyPage } from "@/pages/tabs/MyPage";
import { PlaceListPage } from "@/pages/tabs/PlaceListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <RootIndexPage /> },
      { path: "room", element: <RoomMainPage /> },
      { path: "dev/splash", element: <SplashScreenPage /> },
      { path: "map", element: <MapHomePage /> },
      { path: "list", element: <PlaceListPage /> },
      { path: "course", element: <CoursePlannerPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "login", element: <Navigate to="/" replace /> },
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "onboarding/nickname",
        element: (
          <OnboardingGate>
            <NicknamePage />
          </OnboardingGate>
        ),
      },
      {
        path: "onboarding/terms",
        element: (
          <OnboardingGate>
            <TermsAgreementPage />
          </OnboardingGate>
        ),
      },
    ],
  },
]);

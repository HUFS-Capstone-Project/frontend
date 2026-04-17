import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { OnboardingGate } from "@/app/router/OnboardingGate";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { DevSelectOptionPage } from "@/pages/dev/DevSelectOptionPage";
import { EntryPage } from "@/pages/EntryPage";
import { LoginPage } from "@/pages/LoginPage";
import { MapHomePage } from "@/pages/MapHomePage";
import { NicknamePage } from "@/pages/onboarding/NicknamePage";
import { TermsAgreementPage } from "@/pages/onboarding/TermsAgreementPage";
import { RoomMainPage } from "@/pages/room/RoomMainPage";
import { SplashScreenPage } from "@/pages/SplashScreenPage";
import { CoursePlannerPage } from "@/pages/tabs/CoursePlannerPage";
import { MyPage } from "@/pages/tabs/MyPage";
import { PlaceListPage } from "@/pages/tabs/PlaceListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <EntryPage /> },
      { path: "dev/splash", element: <SplashScreenPage /> },
      { path: "dev/SelectOption", element: <DevSelectOptionPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "app", element: <Navigate to="/" replace /> },
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
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: "room", element: <RoomMainPage /> },
          { path: "map", element: <MapHomePage /> },
          { path: "list", element: <PlaceListPage /> },
          { path: "course", element: <CoursePlannerPage /> },
          { path: "mypage", element: <MyPage /> },
        ],
      },
    ],
  },
]);

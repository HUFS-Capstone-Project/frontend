import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { OnboardingGate } from "@/app/router/OnboardingGate";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import DevClickPlacePage from "@/pages/dev/DevClickPlacePage";
import DevSelectOptionPage from "@/pages/dev/DevSelectOptionPage";
import EntryPage from "@/pages/EntryPage";
import LoginPage from "@/pages/LoginPage";
import { mapHomeLoader } from "@/pages/map/map-home-loader";
import NicknamePage from "@/pages/onboarding/NicknamePage";
import TermsAgreementPage from "@/pages/onboarding/TermsAgreementPage";
import SplashScreenPage from "@/pages/SplashScreenPage";
import MyPagePreview from "@/pages/tabs/MyPage";

const MapHomePage = lazy(() => import("@/pages/MapHomePage"));
const RoomMainPage = lazy(() => import("@/pages/room/RoomMainPage"));
const CoursePlannerPage = lazy(() => import("@/pages/tabs/CoursePlannerPage"));
const MyPage = lazy(() => import("@/pages/tabs/MyPage"));
const PlaceListPage = lazy(() => import("@/pages/tabs/PlaceListPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <EntryPage /> },
      { path: "dev/splash", element: <SplashScreenPage /> },
      { path: "dev/click_place", element: <DevClickPlacePage /> },
      { path: "dev/SelectOption", element: <DevSelectOptionPage /> },
      { path: "dev/list", element: <PlaceListPage /> },
      { path: "dev/mypage", element: <MyPagePreview /> },
      { path: "login", element: <LoginPage /> },
      { path: "dev/course", element: <CoursePlannerPage skipRoomGuard /> },
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
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          { path: "room", element: <RoomMainPage /> },
          { path: "map", element: <MapHomePage />, loader: mapHomeLoader },
          { path: "list", element: <PlaceListPage /> },
          { path: "course", element: <CoursePlannerPage /> },
          { path: "mypage", element: <MyPage /> },
        ],
      },
    ],
  },
]);

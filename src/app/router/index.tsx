import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { OnboardingGate } from "@/app/router/OnboardingGate";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import DevClickPlacePage from "@/pages/dev/DevClickPlacePage";
import DevSelectOptionPage from "@/pages/dev/DevSelectOptionPage";
import EditPlacePage from "@/pages/EditPlacePage";
import EntryPage from "@/pages/EntryPage";
import LoginPage from "@/pages/LoginPage";
import { mapHomeLoader } from "@/pages/map/map-home-loader";
import NicknamePage from "@/pages/onboarding/NicknamePage";
import TermsAgreementPage from "@/pages/onboarding/TermsAgreementPage";
import ReelsPlaceSelectPage from "@/pages/ReelsPlaceSelectPage";
import RegisterPlaceInpersonPage from "@/pages/RegisterPlaceInpersonPage";
import RegisterSelectRoomPage from "@/pages/RegisterSelectRoomPage";
import SplashScreenPage from "@/pages/SplashScreenPage";

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
      { path: "dev/register_place", element: <ReelsPlaceSelectPage /> },
      { path: "edit_place", element: <EditPlacePage /> },
      { path: "register-place-inperson", element: <RegisterPlaceInpersonPage /> },
      { path: "register-select-room", element: <RegisterSelectRoomPage /> },
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

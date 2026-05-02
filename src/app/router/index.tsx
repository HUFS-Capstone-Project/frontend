import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { OnboardingGate } from "@/app/router/OnboardingGate";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import EditPlacePage from "@/pages/EditPlacePage";
import EntryPage from "@/pages/EntryPage";
import LinkPlaceSelectPage from "@/pages/LinkPlaceSelectPage";
import LoginPage from "@/pages/LoginPage";
import { mapHomeLoader } from "@/pages/map/map-home-loader";
import NicknamePage from "@/pages/onboarding/NicknamePage";
import TermsAgreementPage from "@/pages/onboarding/TermsAgreementPage";
import RoomLinkCandidatesPage from "@/pages/rooms/RoomLinkCandidatesPage";
import RoomPlaceFromLinkPage from "@/pages/rooms/RoomPlaceFromLinkPage";
import RoomPlaceSearchPage from "@/pages/rooms/RoomPlaceSearchPage";

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
      { path: "places/register/from-link", element: <LinkPlaceSelectPage /> },
      { path: "places/edit", element: <EditPlacePage /> },
      { path: "login", element: <LoginPage /> },
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
          {
            path: "rooms/:roomId/places/search",
            element: <RoomPlaceSearchPage />,
          },
          {
            path: "rooms/:roomId/places/from-link",
            element: <RoomPlaceFromLinkPage />,
          },
          {
            path: "rooms/:roomId/links/:linkId/candidates",
            element: <RoomLinkCandidatesPage />,
          },
          { path: "places/map", element: <MapHomePage />, loader: mapHomeLoader },
          { path: "places", element: <PlaceListPage /> },
          { path: "courses", element: <CoursePlannerPage /> },
          { path: "me", element: <MyPage /> },
          { path: "rooms", element: <RoomMainPage /> },
        ],
      },
    ],
  },
]);

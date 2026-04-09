import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { OnboardingGate } from "@/app/router/OnboardingGate";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { NicknamePage } from "@/pages/onboarding/NicknamePage";
import { TermsAgreementPage } from "@/pages/onboarding/TermsAgreementPage";
import { RootIndexPage } from "@/pages/RootIndexPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <RootIndexPage /> },
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

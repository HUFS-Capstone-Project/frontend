import { createBrowserRouter, Navigate } from "react-router-dom";

import { OnboardingGate } from "@/app/router/OnboardingGate";
import { RootLayout } from "@/app/layouts/RootLayout";
import { RootIndexPage } from "@/pages/RootIndexPage";
import { NicknamePage } from "@/pages/onboarding/NicknamePage";
import { TermsAgreementPage } from "@/pages/onboarding/TermsAgreementPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <RootIndexPage /> },
      { path: "login", element: <Navigate to="/" replace /> },
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

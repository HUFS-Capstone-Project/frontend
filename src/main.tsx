import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { QueryProvider } from "@/app/providers/QueryProvider";
import { router } from "@/app/router";
import { registerMobileOAuthCallbackHandler } from "@/features/auth/lib/mobile-oauth";
import { registerShareIntentHandler } from "@/features/share-intent/native-share-intent";

registerMobileOAuthCallbackHandler({
  navigate: (path) => {
    void router.navigate(path, { replace: true });
  },
});

registerShareIntentHandler({
  navigate: (path) => {
    void router.navigate(path, { replace: true });
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>,
);

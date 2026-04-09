import "./index.css";

// TODO(모바일 OAuth·딥링크): Capacitor `App.addListener("appUrlOpen", …)` 등으로 OAuth 리다이렉트 URI 처리,
// PKCE 파라미터 추출 후 `completeMobileLoginAfterExchange` 또는 전용 라우트로 넘기기.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { QueryProvider } from "@/app/providers/QueryProvider";
import { router } from "@/app/router";

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

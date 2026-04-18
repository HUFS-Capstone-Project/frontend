import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { QueryProvider } from "@/app/providers/QueryProvider";
import { router } from "@/app/router";

// TODO(모바일 OAuth): Capacitor App.addListener("appUrlOpen", ...)에서 OAuth 리다이렉트 URI 처리,
// PKCE 파라미터 추출 및 completeMobileLoginAfterExchange 전용 플로우로 분기

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

import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/app/layouts/RootLayout";
import { RootIndexPage } from "@/pages/RootIndexPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <RootIndexPage /> },
      { path: "login", element: <Navigate to="/" replace /> },
    ],
  },
]);

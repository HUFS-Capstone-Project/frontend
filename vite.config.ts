import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function fontDisplaySwapToOptional(): Plugin {
  return {
    name: "font-display-swap-to-optional",
    apply: "serve",
    transform(code, id) {
      if (!id.includes("fontsource") || !id.endsWith(".css")) {
        return null;
      }
      if (!code.includes("font-display: swap")) {
        return null;
      }
      return code.replace(/font-display:\s*swap/g, "font-display: optional");
    },
  };
}

function fontDisplaySwapToOptionalBuild(): Plugin {
  return {
    name: "font-display-swap-to-optional-build",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.type === "asset" &&
          chunk.fileName.endsWith(".css") &&
          typeof chunk.source === "string"
        ) {
          chunk.source = chunk.source.replace(/font-display:\s*swap/g, "font-display: optional");
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fontDisplaySwapToOptional(), fontDisplaySwapToOptionalBuild()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // 로컬: `/api` → 백엔드 프록시 (same-origin CSRF)
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

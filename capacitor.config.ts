import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.udidura.app",
  appName: "Udidura",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;

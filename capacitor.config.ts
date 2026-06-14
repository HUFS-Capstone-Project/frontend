import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.udidura.app",
  appName: "어디더라",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;

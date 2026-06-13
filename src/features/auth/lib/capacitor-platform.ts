import { Capacitor } from "@capacitor/core";

export function isAndroidCapacitorApp(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}


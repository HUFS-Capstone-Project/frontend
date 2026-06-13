import { Capacitor, type PluginListenerHandle, registerPlugin } from "@capacitor/core";

import { isAndroidCapacitorApp } from "@/features/auth/lib/capacitor-platform";
import {
  extractFirstHttpUrl,
  setPendingSharedLinkUrl,
} from "@/features/share-intent/shared-link-storage";
import { APP_ROUTES } from "@/shared/config/routes";

type ShareIntentPayload = {
  text?: string | null;
};

type ShareIntentPlugin = {
  getPendingShare(): Promise<ShareIntentPayload>;
  addListener(
    eventName: "shareReceived",
    listenerFunc: (event: ShareIntentPayload) => void,
  ): Promise<PluginListenerHandle>;
};

const ShareIntent = registerPlugin<ShareIntentPlugin>("ShareIntent");

type RegisterShareIntentOptions = {
  navigate: (path: string) => void | Promise<void>;
};

let shareIntentRegistered = false;

export function registerShareIntentHandler(options: RegisterShareIntentOptions): void {
  if (!isAndroidCapacitorApp() || shareIntentRegistered) {
    return;
  }

  shareIntentRegistered = true;

  void ShareIntent.addListener("shareReceived", (event) => {
    handleShareText(event.text, options);
  });

  void ShareIntent.getPendingShare()
    .then((event) => handleShareText(event.text, options))
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error("[udidura] Failed to read pending Android share intent", error);
      }
    });
}

function handleShareText(text: string | null | undefined, options: RegisterShareIntentOptions) {
  if (Capacitor.getPlatform() !== "android" || !text) {
    return;
  }

  const url = extractFirstHttpUrl(text);
  if (!url) {
    return;
  }

  setPendingSharedLinkUrl(url);
  void options.navigate(APP_ROUTES.share);
}

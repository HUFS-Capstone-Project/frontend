import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

export type NativeShareResult = "shared" | "copied" | "cancelled" | "failed";

export type NativeShareOptions = {
  title: string;
  text: string;
  url?: string;
  dialogTitle?: string;
};

function isShareCancelled(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("cancel") || message.includes("abort") || message.includes("dismiss");
}

async function copyShareText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy copy
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  return copied;
}

/**
 * 네이티브(Capacitor) → Web Share API → 클립보드 순으로 공유를 시도한다.
 * 웹 브라우저에서는 기존 Web Share / clipboard 동작을 유지한다.
 */
export async function shareWithNativeFallback(
  options: NativeShareOptions,
): Promise<NativeShareResult> {
  const trimmedText = options.text.trim();
  if (trimmedText.length === 0) {
    return "failed";
  }

  const clipboardText = options.url ? `${trimmedText}\n${options.url}` : trimmedText;

  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title: options.title,
        text: trimmedText,
        url: options.url,
        dialogTitle: options.dialogTitle ?? "공유하기",
      });
      return "shared";
    } catch (error) {
      if (isShareCancelled(error)) {
        return "cancelled";
      }
    }
  }

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: options.title,
        text: trimmedText,
        url: options.url,
      });
      return "shared";
    } catch (error) {
      if (isShareCancelled(error)) {
        return "cancelled";
      }
    }
  }

  const copied = await copyShareText(clipboardText);
  return copied ? "copied" : "failed";
}

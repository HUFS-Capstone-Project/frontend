import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  if (typeof document === "undefined") {
    return () => {};
  }
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function getSnapshot() {
  if (typeof document === "undefined") {
    return true;
  }
  return document.visibilityState === "visible";
}

function getServerSnapshot() {
  return true;
}

/** 탭이 보일 때만 true. */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

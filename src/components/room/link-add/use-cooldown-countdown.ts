import { useEffect, useState } from "react";

type UseCooldownCountdownParams = {
  active: boolean;
  seconds?: number;
};

export function useCooldownCountdown({
  active,
  seconds,
}: UseCooldownCountdownParams): {
  isActive: boolean;
  remainingSeconds: number;
} {
  const initialSeconds = normalizeCooldownSeconds(seconds);
  const [startedAtMs] = useState(() => Date.now());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - startedAtMs) / 1_000));
  const remainingSeconds = Math.max(0, initialSeconds - elapsedSeconds);

  useEffect(() => {
    if (!active || initialSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [active, initialSeconds]);

  return {
    isActive: active && remainingSeconds > 0,
    remainingSeconds,
  };
}

export function formatCooldown(seconds: number): string {
  const normalizedSeconds = normalizeCooldownSeconds(seconds);
  if (normalizedSeconds <= 0) {
    return "잠시";
  }

  const minutes = Math.floor(normalizedSeconds / 60);
  const remainingSeconds = normalizedSeconds % 60;
  if (minutes <= 0) {
    return `${remainingSeconds}초`;
  }
  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }
  return `${minutes}분 ${remainingSeconds}초`;
}

function normalizeCooldownSeconds(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.ceil(value);
}

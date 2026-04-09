import type { CompositionEvent } from "react";
import { useCallback, useRef, useState } from "react";

type CommitValue = (value: string) => void;

/**
 * 제어 문자열 입력에서 `maxLength` 초과 시도 시 경고 플래그 + 값 slice.
 *
 * IME 조합 중에는 `value`가 한도 미만으로 잠깐 바뀌는 경우가 있어,
 * `value.length`만으로 경고를 끄면 깜빡인다. 조합 중에는 경고를 유지하고,
 * 조합 종료·일반 입력에서만 플래그를 내린다.
 */
export function useControlledMaxLengthWarning(
  maxLength: number | undefined,
  value: string,
) {
  const [limitAttempted, setLimitAttempted] = useState(false);
  const isComposingRef = useRef(false);
  const [isComposing, setIsComposing] = useState(false);

  const limitWarning =
    limitAttempted &&
    maxLength !== undefined &&
    (value.length >= maxLength || isComposing);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      setIsComposing(false);
      if (maxLength !== undefined && e.currentTarget.value.length < maxLength) {
        setLimitAttempted(false);
      }
    },
    [maxLength],
  );

  const notifyLimitAttempt = useCallback(() => {
    setLimitAttempted(true);
  }, []);

  const applyChange = useCallback(
    (next: string, commit: CommitValue) => {
      if (maxLength === undefined) {
        commit(next);
        return;
      }
      if (next.length > maxLength) {
        setLimitAttempted(true);
        commit(next.slice(0, maxLength));
        return;
      }
      if (next.length < maxLength && !isComposingRef.current) {
        setLimitAttempted(false);
      }
      commit(next);
    },
    [maxLength],
  );

  return {
    limitWarning,
    notifyLimitAttempt,
    applyChange,
    handleCompositionStart,
    handleCompositionEnd,
  };
}

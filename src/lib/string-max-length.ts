export function lengthAfterInsertAtSelection(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  insertLen: number,
): number {
  const start = selectionStart ?? 0;
  const end = selectionEnd ?? 0;
  const selLen = Math.max(0, end - start);
  return value.length - selLen + insertLen;
}

import type { LinkAnalysisResult } from "./types";

export function shouldAutoExitToInperson(result: LinkAnalysisResult): boolean {
  const isSucceeded = result.status === "SUCCEEDED";
  const hasNoCandidates = result.candidatePlaces.length === 0;
  return result.analysisRequestId != null && isSucceeded && hasNoCandidates;
}

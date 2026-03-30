import type { IntentCandidate } from "../types";

export function rankIntentCandidates(candidates: IntentCandidate[]) {
  return [...candidates].sort((left, right) => {
    if (left.priority !== right.priority) {
      return right.priority - left.priority;
    }

    if (left.score !== right.score) {
      return right.score - left.score;
    }

    return left.intent.localeCompare(right.intent);
  });
}

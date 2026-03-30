import { runFigmaLinkAdapter } from "./adapters/figma-link-adapter";
import { runPromptAdapter } from "./adapters/prompt-adapter";
import { rankIntentCandidates } from "./critic/rank-intents";
import type { AgentInputEnvelope, RoutingAdapter, RoutingDecision } from "./types";

const DEFAULT_ADAPTERS: RoutingAdapter[] = [runPromptAdapter, runFigmaLinkAdapter];

export function runRoutingPipeline(
  envelope: AgentInputEnvelope,
  adapters: RoutingAdapter[] = DEFAULT_ADAPTERS,
): RoutingDecision {
  const adapterResults = adapters.map((adapter) => adapter(envelope));
  const rankedCandidates = rankIntentCandidates(
    adapterResults.flatMap((result) => result.candidates),
  );
  const accepted = rankedCandidates[0] ?? null;
  const rejected = accepted ? rankedCandidates.slice(1) : [];
  const diagnostics = [
    ...adapterResults.flatMap((result) => result.diagnostics),
    accepted
      ? `Accepted ${accepted.intent} from ${accepted.adapterId}.`
      : "No routing candidate was accepted.",
    ...rejected.map(
      (candidate) =>
        `Rejected ${candidate.intent} from ${candidate.adapterId} with priority ${candidate.priority} and score ${candidate.score.toFixed(2)}.`,
    ),
  ];

  return {
    envelope,
    adapterResults,
    accepted,
    rejected,
    diagnostics,
  };
}

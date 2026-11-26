# Backend mapping

Verified against backend default branch commit `40f0506a75f052bbaccdc0ae457cbea2d26450ff`. Source remains in the private backend repository; this repository contains only public API field names and adapter behavior.

| MCP operation | Backend read |
| --- | --- |
| Discover, compare, recommend, industry differences, recent model evaluations | POST `/api/open/model/list`, JSON `{leaderboardKey?}` |
| Methodology | POST `/api/open/leaderboard/detail`, JSON `{leaderboardKey}` |

Full JSON is intentional: compact transport requires separate decoding; deferred summary/usage queries need catalog revision coordination. A single full response keeps scores and usage in one snapshot. Each response must contain `models`, `categories` and the selected index key.

Model fields: `uniqueKey`, `modelId`, `reasoningEffort`, `score`, `dimensionScores`, `caseUsage`, `dimensionCaseUsage`, `releaseDate`, `hasUnderwayTag`, `hasControversialTag`, `usageAccountingMode`. New releases are filtered by day-precision `releaseDate`; the backend's published article and timeline interfaces are not yet exposed as plugin tools.

Recommendation sorting is selected-dimension score descending after explicit constraints. No arbitrary cost-quality weighted score. Cost limits require `pricedCaseCount == caseCount > 0`. Unknown completion/dispute tags are excluded from automated recommendations. Case time is not TTFT.

The backend also has a model recommendation chat service, but it uses account/session state. This first version uses public catalog data and deterministic filtering instead.

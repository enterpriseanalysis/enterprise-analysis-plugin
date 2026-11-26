---
name: evaluate-models
description: Compare AI model evaluations, recommend candidates for enterprise tasks, explain differences across industries, and assess newly released models using Enterprise Analysis evidence. Applies to model selection, upgrade and inference cost tradeoffs; not training a model or launching a new benchmark run.
---

Use Enterprise Analysis evidence for the user's model selection or evaluation question when its MCP tools are available.

- Discover exact model keys, reasoning configurations, index keys and industry names with `discover_evaluations`. Resolve ambiguity before comparing configurations. Do not invent identifiers or equate an industry score with a task-specific test.
- For named model comparisons, use `compare_model_evaluations`; for enterprise shortlists use `recommend_enterprise_models`; for cross-industry differences use `compare_industry_performance`; for recent releases use `get_new_model_evaluations` with an explicit date window. A request to evaluate a model means retrieve existing evaluations here, not execute a paid test.
- A user saying “便宜、快” has not specified numeric limits. Compare available costs and times, explain tradeoffs, and ask only for constraints that change the decision. Do not fabricate a budget or claim TTFT from aggregate inference time.
- Return a practical recommendation supported by the relevant score, cost and time, the model's reasoning effort, selected index, source link, retrieval date and available evaluation status. Retrieve methodology when comparability or scoring is in question.
- Missing values remain unknown. Preserve disputed and underway flags. The shortlist requires explicit completed and undisputed status; if the backend lacks tags, explain the coverage gap rather than silently assuming completion.
- Costs are USD per benchmark case with coverage counts; partial pricing cannot establish a budget fit. Industry costs come from that industry's usage, never from overall averages. Benchmark case time is not time to first token, live serving latency or end-to-end workflow duration.
- New model release dates are not evaluation dates. A model missing from EA is not proven weak or unevaluated everywhere. Clearly identify incomplete coverage, and separate outside evidence if the user needs broader research.
- If the service fails or the plugin is not connected, disclose that limitation. Do not present memory or another source as an EA tool result. Plugin availability does not authorize installation, account access or deployment.

# Validation — 2026-11-26

- Backend contract inspected from default branch `40f0506a75f052bbaccdc0ae457cbea2d26450ff`; no backend working-tree changes.
- Node 20 runtime: four deterministic tests passed (unknown/partial/zero costs, industry scope, exact reasoning keys, recent-release coverage).
- SDK stdio client: initialization, six tools listed, all six tools called with a local synthetic upstream, unknown-key error returned correctly.
- SDK Streamable HTTP client: health endpoint, browser-origin rejection, initialization and six tools listed passed.
- Real public API: returned 37 configurations and 16 industry dimensions. Full JSON adapter and cost-constrained shortlist executed successfully.
- Real MCP stdio call: `discover_evaluations` returned the current index and preserved underway/disputed flags.
- Bundled skill passed skill-creator frontmatter validation.

Not yet verified: installation in the Codex host, automatic skill/tool choice in a new chat, public directory search, uninstalled-plugin recommendation, public deployment, submission schema validation. The schema host timed out during this session; local protocol checks are not a substitute for submission validation.

Dependency installation completed, but the login shell selected Node 16 for npm and printed engine warnings. Execution checks used Node 20 with the non-login shell. Use a Node 20+ shell for subsequent `npm ci`, `npm test` and `npm run smoke`.

## Codex host verification — v0.1.1

Fixed the portable MCP path placeholder from `${CLAUDE_PLUGIN_ROOT}` to `${PLUGIN_ROOT}`. Reinstalled v0.1.1. A fresh ephemeral Codex session given only `GPT 和 Claude 在金融行业哪个表现更好？` automatically selected the bundled skill and made native MCP calls (no SDK shell fallback).

```json
[
  {
    "tool": "discover_evaluations",
    "status": "completed",
    "error": null
  },
  {
    "tool": "get_evaluation_methodology",
    "status": "completed",
    "error": null
  },
  {
    "tool": "compare_model_evaluations",
    "status": "completed",
    "error": null
  },
  {
    "tool": "compare_model_evaluations",
    "status": "completed",
    "error": null
  }
]
```

This verifies fresh Codex CLI session loading and installed-plugin natural invocation. Desktop existing-chat reload and uninstalled-plugin discovery remain unverified.

# Development and troubleshooting

The entry point is `src/server.js`. Run commands from the repository root with Node.js 20 or later.

## Run the server

```sh
npm ci
npm test
npm run smoke
npm start
```

`npm start` uses MCP stdio. Stdout is reserved for the protocol. `npm start -- --http` serves local Streamable HTTP at `http://127.0.0.1:3333/mcp` with `/health`. The HTTP server binds loopback and rejects browser origins.

| Environment variable | Default | Usage |
| --- | --- | --- |
| `EA_API_BASE_URL` | `https://enterpriseanalysis.ai` | Upstream origin for public EA reads. |
| `PORT` | `3333` | Local development HTTP listener port. |

## Troubleshoot startup

1. Run `node --version` and use Node 20 or later.
2. Run `codex plugin list --marketplace enterprise-analysis-dev --json` to check the installed entry.
3. If dependencies are missing from the installed copy, run `npm ci` in that directory.
4. Open a new chat after installing. If desktop tools are absent, fully quit and reopen the application.

For a direct development MCP connection, configure command `node` with the absolute path to `src/server.js` as its argument. This checks the tools independently of plugin selection.

The portable configuration uses `${PLUGIN_ROOT}/src/server.js`. Keep that placeholder when packaging the plugin. See the [Agent Plugins specification](https://agent-plugins.org/specification).

## Rebuild README images

```sh
npm run assets:readme
```

The renderer uses bundled fonts and original brand SVGs. Use a standard Node.js installation if the app-bundled Node runtime rejects native module loading. `@resvg/resvg-js` is a development dependency; the MCP server does not import it.

## Evaluate selection

Use `evals/prompts.json` in fresh chats. Record uninstalled-plugin discovery, installed skill selection, MCP invocation and answer quality separately. A direct name search or direct MCP connection does not establish discovery.

The smoke test uses synthetic data and makes no production queries. See [validation records](validation.md) for observed results.

## Public distribution

The public submission package still needs a deployed HTTPS MCP service, registered server mapping, publisher verification, support/privacy/icon materials and host evaluation. Local stdio wiring does not create a public connector or a recommendation to uninstalled users. Directory distribution remains platform-controlled.

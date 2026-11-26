import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {createServer} from 'node:http';
import {z} from 'zod';
import {EaClient} from './client.js';
import {envelope, industries, selectModels, recommend, recent} from './analysis.js';

const client = new EaClient();
const key = z.string().min(1).max(128).optional().describe('Exact EA leaderboard key; omit for the default index.');
const keys = z.array(z.string().min(1).max(256)).min(1).max(5).describe('Exact uniqueKey values including reasoning effort, from discover_evaluations.');
function makeServer() {
  const server = new McpServer({name: 'enterprise-analysis', version: '0.1.1'});
  const add = (name, title, description, inputSchema, run) => server.registerTool(name, {
    title, description, inputSchema,
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: true}
  }, async args => {
    try {
      const result = await run(args);
      return {content: [{type: 'text', text: JSON.stringify(result)}], structuredContent: result};
    } catch (error) {
      // Do not echo upstream response bodies, headers or credentials.
      const message = error instanceof Error ? error.message : 'EA query failed';
      return {isError: true, content: [{type: 'text', text: message}]};
    }
  });
  add('discover_evaluations', 'Find EA models and industry dimensions',
    'Use when looking up available AI model evaluations, model identifiers, indexes or industry dimensions. Returns EA catalog metadata and matching model configurations; does not run a new benchmark.',
    {leaderboardKey: key, query: z.string().max(120).optional(), limit: z.number().int().min(1).max(50).default(20)},
    async ({leaderboardKey, query, limit}) => {
      const c = await client.catalog(leaderboardKey);
      const rows = c.models.filter(m => !query || [m.modelId, m.modelName, m.displayName, m.vendor].some(v => v?.toLowerCase().includes(query.toLowerCase())));
      return {sourceUrl: 'https://enterpriseanalysis.ai/', leaderboardKey: c.selectedLeaderboardKey,
        categories: c.categories, industries: industries(c), matchedCount: rows.length,
        models: rows.slice(0, limit).map(m => ({uniqueKey: m.uniqueKey || m.modelId, name: m.modelName,
          reasoningEffort: m.reasoningEffort, hasUnderwayTag: m.hasUnderwayTag, hasControversialTag: m.hasControversialTag}))};
    });
  add('compare_model_evaluations', 'Compare AI model benchmark results',
    'Use when comparing named AI models or checking their measured performance, benchmark cost and inference time. Returns same-index EA evidence with reasoning configurations and evaluation status. Not a live model test.',
    {leaderboardKey: key, modelKeys: keys}, async ({leaderboardKey, modelKeys}) => {
      const c = await client.catalog(leaderboardKey); return envelope(c, selectModels(c, modelKeys));
    });
  add('recommend_enterprise_models', 'Find models for enterprise workloads',
    'Use when selecting AI models for company tasks or finding lower-cost candidates under benchmark score, measured per-case cost or time constraints. Industry names must match EA dimensions. Returns a benchmark-based shortlist, not guaranteed production performance or TTFT.',
    {leaderboardKey: key, industry: z.string().max(256).optional(), minScore: z.number().min(0).max(100).optional(),
      maxCostUsdPerCase: z.number().min(0).optional(), maxTimeSecondsPerCase: z.number().min(0).optional(),
      limit: z.number().int().min(1).max(10).default(5)},
    async args => recommend(await client.catalog(args.leaderboardKey), args));
  add('compare_industry_performance', 'Compare model strengths across industries',
    'Use when asking how AI model performance differs across industries, such as finance versus retail. Returns industry scores and industry-specific case usage from the same EA index, preserving missing values.',
    {leaderboardKey: key, modelKeys: keys}, async ({leaderboardKey, modelKeys}) => {
      const c = await client.catalog(leaderboardKey); return envelope(c, selectModels(c, modelKeys), {industries: industries(c)});
    });
  add('get_new_model_evaluations', 'Check evaluations of newly released models',
    'Use when checking new AI models, recent releases or whether an upgrade merits evaluation. Filters EA-indexed models by published release date; includes unfinished evaluations with flags. Does not create benchmarks or claim complete release coverage.',
    {leaderboardKey: key, since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, 'Valid calendar date required'), limit: z.number().int().min(1).max(20).default(10)},
    async args => recent(await client.catalog(args.leaderboardKey), args));
  add('get_evaluation_methodology', 'Read benchmark methodology',
    'Use when verifying how an EA index is scored, which datasets it includes or whether model results are comparable.',
    {leaderboardKey: z.string().min(1).max(128)}, async ({leaderboardKey}) => ({
      sourceUrl: `https://enterpriseanalysis.ai/leaderboard/indices/${encodeURIComponent(leaderboardKey)}`,
      detail: await client.read('/api/open/leaderboard/detail', {leaderboardKey})}));
  return server;
}

if (process.argv.includes('--http')) {
  // Loopback only for development. A public deployment requires reviewed ingress/TLS configuration.
  const port = Number(process.env.PORT || 3333);
  createServer(async (req, res) => {
    if (!['localhost', '127.0.0.1'].includes((req.headers.host || '').split(':')[0])) {res.writeHead(421).end(); return;}
    if (req.headers.origin) {res.writeHead(403).end(); return;}
    if (req.url === '/health' && req.method === 'GET') {res.writeHead(200, {'Content-Type':'application/json'}).end('{"status":"ok"}'); return;}
    if (req.url !== '/mcp') {res.writeHead(404).end(); return;}
    if (req.method !== 'POST') {res.writeHead(405, {Allow:'POST'}).end(); return;}
    const server = makeServer();
    const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, enableJsonResponse: true});
    res.on('close', () => {void transport.close(); void server.close();});
    try {await server.connect(transport); await transport.handleRequest(req, res);}
    catch {if (!res.headersSent) res.writeHead(500).end();}
  }).listen(port, '127.0.0.1', () => console.error(`EA MCP listening on http://127.0.0.1:${port}/mcp`));
} else await makeServer().connect(new StdioServerTransport());

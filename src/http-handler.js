import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {makeServer} from './mcp-server.js';

export async function handleMcp(req, res) {
  const origins = (process.env.MCP_ALLOWED_ORIGINS || '').split(',').filter(Boolean);
  const origin = req.headers.origin;
  if (origin && !origins.includes(origin)) {res.writeHead(403).end(); return;}
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Protocol-Version, Mcp-Session-Id');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') {res.writeHead(204).end(); return;}
  if (req.method !== 'POST') {res.writeHead(405, {Allow:'POST, OPTIONS'}).end(); return;}
  const server = makeServer();
  const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined, enableJsonResponse: true});
  res.on('close', () => {void transport.close(); void server.close();});
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch {
    if (!res.headersSent) res.writeHead(500, {'Content-Type':'application/json'}).end('{"error":"MCP request failed"}');
  }
}

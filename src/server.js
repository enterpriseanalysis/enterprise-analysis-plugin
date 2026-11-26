import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {createServer} from 'node:http';
import {makeServer} from './mcp-server.js';
import {handleMcp} from './http-handler.js';

if (process.argv.includes('--http')) {
  const port = Number(process.env.PORT || 3333);
  createServer(async (req, res) => {
    if (!['localhost', '127.0.0.1'].includes((req.headers.host || '').split(':')[0])) {res.writeHead(421).end(); return;}
    if (req.url === '/health' && req.method === 'GET') {res.writeHead(200, {'Content-Type':'application/json'}).end('{"status":"ok"}'); return;}
    if (req.url !== '/mcp') {res.writeHead(404).end(); return;}
    await handleMcp(req, res);
  }).listen(port, '127.0.0.1', () => console.error(`EA MCP listening on http://127.0.0.1:${port}/mcp`));
} else await makeServer().connect(new StdioServerTransport());

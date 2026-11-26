import {createServer} from 'node:http';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {handleMcp} from '../src/http-handler.js';

test('HTTP transport exposes tools and rejects unapproved browser origins', async () => {
  const server=createServer(handleMcp);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=new URL(`http://127.0.0.1:${server.address().port}/mcp`);
  const client=new Client({name:'http-test',version:'0.1.0'});
  try {
    const response=await fetch(url,{method:'POST',headers:{Origin:'https://unapproved.example'}});
    assert.equal(response.status,403);
    await client.connect(new StreamableHTTPClientTransport(url));
    assert.equal((await client.listTools()).tools.length,6);
  } finally {
    await client.close();
    await new Promise(resolve=>server.close(resolve));
  }
});

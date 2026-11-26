import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

const fixture = {selectedLeaderboardKey:'synthetic',categories:[],dimensions:[{name:'Finance'}],models:[{
  modelId:'fixture',uniqueKey:'fixture|high',modelName:'Synthetic model',score:80,dimensionScores:{Finance:75},
  hasUnderwayTag:false,hasControversialTag:false,releaseDate:'2026-11-01',
  caseUsage:{caseCount:10,pricedCaseCount:10,avgCostUsd:0.01,avgTimeSeconds:2}
}]};
const upstream = createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify(req.url === '/api/open/model/list' ? fixture : {calculationDescription:'Synthetic methodology'}));
});
await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
const client = new Client({name:'ea-smoke',version:'0.1.0'});
try {
  await client.connect(new StdioClientTransport({command:process.execPath,args:['src/server.js'],
    env:{...process.env,EA_API_BASE_URL:`http://127.0.0.1:${upstream.address().port}`}}));
  const tools = await client.listTools(); assert.equal(tools.tools.length,6);
  const cases = [
    ['discover_evaluations',{}],['compare_model_evaluations',{modelKeys:['fixture|high']}],
    ['recommend_enterprise_models',{maxCostUsdPerCase:0.1}],
    ['compare_industry_performance',{modelKeys:['fixture|high']}],
    ['get_new_model_evaluations',{since:'2026-10-01'}],
    ['get_evaluation_methodology',{leaderboardKey:'synthetic'}]
  ];
  for(const [name,args] of cases) {
    const result = await client.callTool({name,arguments:args});
    assert.ok(!result.isError,`${name}: ${JSON.stringify(result.content)}`);
    assert.ok(result.structuredContent);
  }
  const missing = await client.callTool({name:'compare_model_evaluations',arguments:{modelKeys:['missing']}});
  assert.equal(missing.isError,true);
  console.log('MCP initialize, tools/list, six tool calls and error handling passed (synthetic upstream).');
} finally {await client.close(); await new Promise(resolve=>upstream.close(resolve));}

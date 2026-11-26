import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommend, recent, selectModels} from '../src/analysis.js';

// Synthetic evidence only; these are not real model scores.
export const catalog = {selectedLeaderboardKey:'synthetic', categories:[], dimensions:[{name:'Finance'}], models:[
  {modelId:'cheap', uniqueKey:'cheap|high', score:80, dimensionScores:{Finance:70}, hasUnderwayTag:false, hasControversialTag:false,
    releaseDate:'2026-11-01', caseUsage:{caseCount:10, pricedCaseCount:10, avgCostUsd:0, avgTimeSeconds:2},
    dimensionCaseUsage:{Finance:{caseCount:10, pricedCaseCount:10, avgCostUsd:2, avgTimeSeconds:4}}},
  {modelId:'partial', uniqueKey:'partial', score:99, hasUnderwayTag:false, hasControversialTag:false,
    caseUsage:{caseCount:10, pricedCaseCount:1, avgCostUsd:0.01}},
  {modelId:'pending', uniqueKey:'pending', score:100, hasUnderwayTag:true, hasControversialTag:false},
  {modelId:'unknown', uniqueKey:'unknown', score:100},
  {modelId:'disputed', uniqueKey:'disputed', score:100, hasUnderwayTag:false, hasControversialTag:true}
]};
test('budget preserves actual zero and excludes partial, absent and unfinished evidence', () => {
  assert.deepEqual(recommend(catalog,{maxCostUsdPerCase:0.1}).models.map(m=>m.modelId),['cheap']);
});
test('industry budget uses industry usage, never overall average', () => {
  assert.equal(recommend(catalog,{industry:'Finance',maxCostUsdPerCase:0.1}).models.length,0);
  assert.throws(()=>recommend(catalog,{industry:'Invented'}),/Unknown industry/);
});
test('exact model configuration required', () => {
  assert.throws(()=>selectModels(catalog,['cheap']),/Unknown or ambiguous/);
  assert.equal(selectModels(catalog,['cheap|high'])[0].modelId,'cheap');
});
test('recent releases preserve status and exclude unknown or imprecise dates', () => {
  const data = {...catalog, models:[...catalog.models,{modelId:'month-only',releaseDate:'2026-11'}]};
  assert.deepEqual(recent(data,{since:'2026-10-01'}).models.map(m=>m.modelId),['cheap']);
});

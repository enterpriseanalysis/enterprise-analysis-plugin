const numeric = value => typeof value === 'number' && Number.isFinite(value);
const fields = ['modelId', 'modelName', 'displayName', 'vendor', 'uniqueKey', 'reasoningEffort', 'score',
  'dimensionScores', 'caseUsage', 'dimensionCaseUsage', 'releaseDate', 'hasUnderwayTag',
  'hasControversialTag', 'usageAccountingMode', 'capabilities'];
export function summarize(model) {
  return Object.fromEntries(fields.filter(key => model[key] !== undefined).map(key => [key, model[key]]));
}
export function envelope(catalog, models, extra = {}) {
  return {
    source: 'Enterprise Analysis', sourceUrl: 'https://enterpriseanalysis.ai/',
    fetchedAt: new Date().toISOString(), serverTime: catalog.serverTime ?? null,
    leaderboardKey: catalog.selectedLeaderboardKey, catalogRevision: catalog.catalogRevision ?? null,
    limitations: ['Benchmark results are evidence for a shortlist, not a guarantee on your workload.',
      'Cost is measured USD per benchmark case, not token list price or your projected bill.',
      'Time is benchmark inference time, not time to first token or end-to-end customer response time.',
      'Missing values are unknown, never zero. Preserve reasoning effort and evaluation status.'],
    ...extra, models: models.map(summarize)
  };
}
export function industries(catalog) {
  return [...new Set([...(catalog.dimensions || []).map(x => x.name),
    ...catalog.models.flatMap(x => Object.keys(x.dimensionScores || {}))])].filter(Boolean);
}
export function checkIndustry(catalog, industry) {
  if (industry && !industries(catalog).includes(industry)) throw new Error(`Unknown industry. Use an exact dimension name: ${industries(catalog).join(', ')}`);
}
export function selectModels(catalog, keys) {
  const matches = keys.map(key => {
    const rows = catalog.models.filter(m => (m.uniqueKey || m.modelId) === key);
    if (rows.length !== 1) throw new Error(`Unknown or ambiguous model key: ${key}. Discover exact keys first.`);
    return rows[0];
  });
  return matches;
}
export function recommend(catalog, {industry, minScore, maxCostUsdPerCase, maxTimeSecondsPerCase, limit = 5}) {
  checkIndustry(catalog, industry);
  const score = m => industry ? m.dimensionScores?.[industry] : m.score;
  const usage = m => industry ? m.dimensionCaseUsage?.[industry] : m.caseUsage;
  const rows = catalog.models.filter(m => {
    if (m.hasUnderwayTag !== false || m.hasControversialTag !== false || !numeric(score(m))) return false;
    if (minScore !== undefined && score(m) < minScore) return false;
    const u = usage(m);
    if (maxCostUsdPerCase !== undefined && (!numeric(u?.avgCostUsd) || u.avgCostUsd < 0 ||
      !numeric(u.caseCount) || u.caseCount <= 0 || u.pricedCaseCount !== u.caseCount || u.avgCostUsd > maxCostUsdPerCase)) return false;
    if (maxTimeSecondsPerCase !== undefined && (!numeric(u?.avgTimeSeconds) || u.avgTimeSeconds < 0 ||
      !numeric(u.caseCount) || u.caseCount <= 0 || u.avgTimeSeconds > maxTimeSecondsPerCase)) return false;
    return true;
  }).sort((a, b) => score(b) - score(a));
  return envelope(catalog, rows.slice(0, limit), {industry: industry ?? null,
    matchedCount: rows.length, rankingRule: 'Highest selected benchmark score among eligible models; no synthetic composite score.',
    eligibility: 'Requires explicit completed and undisputed tags; budget filters require full priced case coverage.',
    constraints: {minScore, maxCostUsdPerCase, maxTimeSecondsPerCase}});
}
export function recent(catalog, {since, limit = 10}) {
  const rows = catalog.models.filter(m => /^\d{4}-\d{2}-\d{2}$/.test(m.releaseDate || '') && m.releaseDate >= since)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  return envelope(catalog, rows.slice(0, limit), {since, matchedCount: rows.length,
    coverage: 'Models present in this EA index with day-precision release dates. This is not a complete release feed; release date is not evaluation date.'});
}

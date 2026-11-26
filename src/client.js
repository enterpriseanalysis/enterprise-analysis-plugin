export class EaClient {
  constructor(baseUrl = process.env.EA_API_BASE_URL || 'https://enterpriseanalysis.ai') {
    this.base = new URL(baseUrl);
    if (!['https:', 'http:'].includes(this.base.protocol)) throw new Error('EA_API_BASE_URL must be HTTP(S)');
  }
  async read(path, body = {}) {
    const response = await fetch(new URL(path, this.base), {
      method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(body), signal: AbortSignal.timeout(30000), redirect: 'error'
    });
    if (!response.ok) throw new Error(`EA API HTTP ${response.status}; check service availability and query parameters`);
    const data = await response.json();
    if (data?.success === false) throw new Error('EA API returned an unsuccessful response');
    return data;
  }
  async catalog(leaderboardKey) {
    // Full JSON retains dimension usage, status tags and configuration. No compact transport decoding needed.
    const data = await this.read('/api/open/model/list', leaderboardKey ? {leaderboardKey} : {});
    if (!Array.isArray(data?.models) || !Array.isArray(data?.categories)) throw new Error('Invalid EA catalog response');
    if (leaderboardKey && data.selectedLeaderboardKey !== leaderboardKey) throw new Error('EA returned a different leaderboard; comparison stopped');
    return data;
  }
}

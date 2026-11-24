// In-memory AdminStore for admin service tests.
export function createMemoryAdminStore(seed = {}) {
  const db = {
    collectors: structuredClone(seed.collectors ?? []),
    pushCounts: { ...(seed.pushCounts ?? {}) },
    stats: { ...(seed.stats ?? {}) },
    submissions: structuredClone(seed.submissions ?? []),
    problems: structuredClone(seed.problems ?? []),
  };
  let nextId = 1;
  const camel = key => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return {
    db,
    async listCollectors() { return structuredClone(db.collectors); },
    async countPushTargets(collectorId) { return db.pushCounts[collectorId] ?? 0; },
    async collectorStats(collectorId) { return db.stats[collectorId] ?? { rating: null, completedJobs: 0 }; },
    async createCollector(row) {
      if (db.collectors.some(c => c.phone === row.phone)) return { duplicate: true };
      const id = `c-${nextId++}`;
      db.collectors.push({ id, active: true, paused: false, areas: [], lastDigestAt: null, createdAt: "2026-11-24T00:00:00.000Z", ...row });
      return { id };
    },
    async updateCollector(id, patch) {
      const row = db.collectors.find(c => c.id === id);
      if (!row) return false;
      if (patch.phone && db.collectors.some(c => c.id !== id && c.phone === patch.phone)) return "duplicate";
      for (const [key, value] of Object.entries(patch)) row[camel(key)] = value;
      return true;
    },
    async replaceAreas(id, areas) { const row = db.collectors.find(c => c.id === id); if (row) row.areas = structuredClone(areas); },
    async listEscalated(minWaves) { return structuredClone(db.submissions.filter(s => s.status === "pending" && s.waveCount >= minWaves)); },
    async listOpenProblems() { return structuredClone(db.problems.filter(p => !p.resolvedAt)); },
    async resolveProblem(id, at) {
      const row = db.problems.find(p => p.id === id && !p.resolvedAt);
      if (!row) return false;
      row.resolvedAt = at;
      return true;
    },
  };
}

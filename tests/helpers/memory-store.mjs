// In-memory CollectorStore used by service tests. Mirrors the contract of the Supabase store.
export function createMemoryStore(seed = {}) {
  const db = {
    collectors: structuredClone(seed.collectors ?? []),
    submissions: structuredClone(seed.submissions ?? []),
    offers: structuredClone(seed.offers ?? []),
    pushTargets: structuredClone(seed.pushTargets ?? []),
    notifications: [],
    problems: [],
    ownerEmails: { ...(seed.ownerEmails ?? {}) },
    ratings: { ...(seed.ratings ?? {}) },
  };
  let nextId = 1;
  const newId = () => `id-${nextId++}`;
  const matches = (row, expected) => Object.entries(expected).every(([key, value]) => row[key] === value);
  const camel = key => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  // Like a database, reads return copies: later writes never change a row a caller already holds.
  const copy = row => (row ? structuredClone(row) : null);

  return {
    db,
    async getCollectorByTokenHash(hash) { return copy(db.collectors.find(c => c.tokenHash === hash && c.active)); },
    async getCollector(collectorId) { return copy(db.collectors.find(c => c.id === collectorId)); },
    async listDispatchable() { return db.collectors.filter(c => c.active).map(copy); },
    async getSubmission(submissionId) { return copy(db.submissions.find(s => s.id === submissionId)); },
    async listPending() { return db.submissions.filter(s => s.status === "pending").map(copy); },
    async listHeldBy(collectorId) { return db.submissions.filter(s => s.status === "accepted" && s.collectorId === collectorId).map(copy); },
    async replaceAreas(collectorId, areas) { const row = db.collectors.find(c => c.id === collectorId); if (row) row.areas = structuredClone(areas); },
    async listOfferedCollectorIds(submissionId) { return db.offers.filter(o => o.submissionId === submissionId).map(o => o.collectorId); },
    async insertOffers(rows) {
      for (const row of rows) {
        if (db.offers.some(o => o.submissionId === row.submissionId && o.collectorId === row.collectorId)) continue;
        db.offers.push({ id: newId(), status: "sent", openedAt: null, ...row });
      }
    },
    async getOfferByTokenHash(hash) { return copy(db.offers.find(o => o.tokenHash === hash)); },
    async findOffer(submissionId, collectorId) { return copy(db.offers.find(o => o.submissionId === submissionId && o.collectorId === collectorId)); },
    async markOfferOpened(offerId, at) {
      const offer = db.offers.find(o => o.id === offerId);
      if (offer && !offer.openedAt) offer.openedAt = at;
    },
    async setOffersStatus(submissionId, status, opts = {}) {
      for (const offer of db.offers) {
        if (offer.submissionId !== submissionId) continue;
        if (opts.onlyCollectorId && offer.collectorId !== opts.onlyCollectorId) continue;
        if (opts.exceptCollectorId && offer.collectorId === opts.exceptCollectorId) continue;
        if (opts.fromStatus && offer.status !== opts.fromStatus) continue;
        offer.status = status;
      }
    },
    async updateSubmissionIf(submissionId, expected, patch) {
      await Promise.resolve();
      const row = db.submissions.find(s => s.id === submissionId);
      if (!row || !matches(row, expected)) return false;
      for (const [key, value] of Object.entries(patch)) row[camel(key)] = value;
      return true;
    },
    async updateCollector(collectorId, patch) {
      const row = db.collectors.find(c => c.id === collectorId);
      if (row) for (const [key, value] of Object.entries(patch)) row[camel(key)] = value;
    },
    async listPushTargets(collectorId) {
      return db.pushTargets.filter(t => t.collectorId === collectorId).map(({ endpoint, p256dh, auth }) => ({ endpoint, p256dh, auth }));
    },
    async savePushTarget(collectorId, target) {
      db.pushTargets = db.pushTargets.filter(t => t.endpoint !== target.endpoint);
      db.pushTargets.push({ collectorId, ...target });
    },
    async deletePushTarget(endpoint) { db.pushTargets = db.pushTargets.filter(t => t.endpoint !== endpoint); },
    async getOwnerEmail(ownerId) { return db.ownerEmails[ownerId] ?? null; },
    async getCollectorRating(collectorId) { return db.ratings[collectorId] ?? null; },
    async insertProblem(problem) { db.problems.push({ id: newId(), resolvedAt: null, ...problem }); },
    async logNotification(entry) { db.notifications.push({ id: newId(), ...entry }); },
    async listRetryableNotifications(maxAttempts) { return db.notifications.filter(n => n.status === "failed" && n.attempts < maxAttempts).map(copy); },
    async updateNotification(notificationId, patch) { Object.assign(db.notifications.find(n => n.id === notificationId) ?? {}, patch); },
  };
}

export const submission = (overrides = {}) => ({
  id: "sub-1", ownerId: "owner-1", status: "pending", itemName: "Laptop", category: "computers", quantity: 2,
  condition: "damaged", weightLabel: "sekitar 5 kg", photoPath: "owner-1/sub-1/photo.jpg",
  latitude: -7.05, longitude: 110.44, address: "Jl. Banjarsari 12", instructions: "Pagar hijau",
  district: "Tembalang", ownerPhone: "6281234567890", collectorId: null, handoverCode: "0427",
  handoverAttempts: 0, handoverLockedUntil: null, agreedPriceIdr: null, waveCount: 0, lastWaveAt: null,
  createdAt: "2026-11-24T09:00:00.000Z", ...overrides,
});

export const collector = (id, overrides = {}) => ({
  id, name: `Pengepul ${id}`, phone: "6281111111111", active: true, paused: false, notifyMode: "instant",
  areas: [{ latitude: -7.05, longitude: 110.44, radiusKm: 10 }], lastDigestAt: null,
  createdAt: "2026-11-01T00:00:00.000Z", tokenHash: `hash-${id}`, ...overrides,
});

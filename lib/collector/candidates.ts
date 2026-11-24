import type { Coordinates } from "../../app/location/interfaces/coordinates.interface.ts";
import type { CandidateCollector } from "./interfaces/candidate-collector.interface.ts";
import type { WaveDecision } from "./interfaces/wave-decision.type.ts";
import { areaCovers, distanceKm } from "./geo.ts";
import { MAX_WAVES, WAVE_INTERVAL_MINUTES, WAVE_SIZE } from "./rules.ts";

export function selectCandidates(collectors: CandidateCollector[], point: Coordinates, alreadyOffered: Set<string>): CandidateCollector[] {
  return collectors
    .filter(c => c.active && !c.paused && c.notifyMode === "instant" && !alreadyOffered.has(c.id))
    .map(c => ({ collector: c, covering: c.areas.filter(area => areaCovers(area, point)) }))
    .filter(entry => entry.covering.length > 0)
    .map(entry => ({ collector: entry.collector, distance: Math.min(...entry.covering.map(area => distanceKm(area, point))) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, WAVE_SIZE)
    .map(entry => entry.collector);
}

export function decideWave(sub: { status: string; waveCount: number; lastWaveAt: string | null }, now: Date): WaveDecision {
  if (sub.status !== "pending" || sub.waveCount > MAX_WAVES) return "none";
  const due = sub.lastWaveAt === null
    || now.getTime() - new Date(sub.lastWaveAt).getTime() >= WAVE_INTERVAL_MINUTES * 60_000;
  if (!due) return "none";
  return sub.waveCount >= MAX_WAVES ? "escalate" : "wave";
}

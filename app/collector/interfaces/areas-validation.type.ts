import type { CollectorArea } from "../../../lib/collector/interfaces/collector-area.interface.ts";

export type AreasValidation = { ok: true; areas: CollectorArea[] } | { ok: false; error: string };

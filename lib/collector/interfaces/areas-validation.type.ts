import type { CollectorArea } from "./collector-area.interface.ts";

export type AreasValidation = { ok: true; areas: CollectorArea[] } | { ok: false; error: string };

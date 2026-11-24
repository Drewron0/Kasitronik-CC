import type { Metadata } from "next";

/** Shared head settings for collector pages: private, installable as the collector app. */
export const collectorMetadata: Pick<Metadata, "robots" | "manifest"> = {
  robots: { index: false, follow: false },
  manifest: "/pengepul-manifest",
};

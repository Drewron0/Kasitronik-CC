import { connection } from "next/server";
import { getCollectorContext } from "@/lib/collector/server";
import { getCurrentCollector } from "../current-collector";
import { loadHome } from "../load-home";
import CollectorHome from "./CollectorHome";
import InvalidLink from "./InvalidLink";

export default async function CollectorHomeLoader() {
  // Request-time only: the collector comes from a cookie and the data must never be prerendered.
  await connection();
  const ctx = getCollectorContext();
  const collector = await getCurrentCollector(ctx);
  if (!collector) return <InvalidLink />;
  const data = await loadHome(ctx, collector);
  return <CollectorHome collector={collector} {...data} vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""} />;
}

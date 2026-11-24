import { NextResponse } from "next/server";
import { hashToken } from "@/lib/collector/tokens";
import { getAppUrl, getCollectorContext } from "@/lib/collector/server";
import { COLLECTOR_COOKIE, isTokenShape } from "@/app/collector/current-collector";

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Personal link: remembers the collector in an httpOnly cookie, then drops the token from the URL. */
export async function GET(_request: Request, { params }: RouteContext<"/p/[token]">) {
  const { token } = await params;
  const response = NextResponse.redirect(`${getAppUrl()}/p`, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  if (!isTokenShape(token)) return response;
  const collector = await getCollectorContext().store.getCollectorByTokenHash(hashToken(token));
  if (!collector) return response;
  response.cookies.set(COLLECTOR_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: getAppUrl().startsWith("https://"),
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return response;
}

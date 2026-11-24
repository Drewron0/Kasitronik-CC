/** Web app manifest for collectors only, so residents who install the site are not sent to /p. */
export function GET() {
  return Response.json(
    {
      name: "Kasitronik Pengepul",
      short_name: "Pengepul",
      description: "Laporan barang elektronik bekas di wilayah Anda.",
      start_url: "/p",
      scope: "/",
      display: "standalone",
      background_color: "#faf9f7",
      theme_color: "#046645",
      icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } },
  );
}

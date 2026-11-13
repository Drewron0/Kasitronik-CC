import sharp from "sharp";

export async function normalizeImage(bytes: Buffer): Promise<Buffer> {
  const options = { limitInputPixels: 20_000_000, failOn: "warning" as const };
  const metadata = await sharp(bytes, options).metadata();
  if (!["jpeg", "png"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) {
    throw new Error("Unsupported image");
  }
  // Decode and re-encode to reject corrupt files and strip embedded metadata.
  return sharp(bytes, options).rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 }).toBuffer();
}
